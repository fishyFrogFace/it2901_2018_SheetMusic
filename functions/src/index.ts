import * as functions from 'firebase-functions';
import * as path from 'path';
import * as Storage from '@google-cloud/storage';
import {spawn} from 'child-process-promise';
import * as fs from 'fs-extra';
import * as admin from 'firebase-admin';
import * as unzipper from 'unzipper';

admin.initializeApp(functions.config().firebase);

const storage = Storage({keyFilename: 'service-account-key.json'});

// Extracts ZIP with pdfs
exports.extractZip = functions.storage.object().onChange(async event => {
    const object = event.data;

    if (object.resourceState === 'not_exists') return null;

    // Full file path (bands/<bandId>/input/<fileName>.zip)
    const filePath = object.name;

    if (!filePath.endsWith('.zip')) return null;

    const zipPathParts = filePath.split('/');

    if (zipPathParts[0] !== 'bands' || zipPathParts[2] !== 'input') return null;

    const bandId = zipPathParts[1];

    // File name without extension
    const fileName = path.basename(filePath, '.zip');

    // Create storage bucket
    const bucket = storage.bucket(object.bucket);

    try {
        // Download to local directory
        await bucket.file(filePath).download({destination: `/tmp/${fileName}.zip`});

        // Unzip
        const dir = await unzipper.Open.file(`/tmp/${fileName}.zip`);

        await Promise.all(
            dir.files
                .filter(file => !file.path.endsWith('/'))
                .filter(file => file.path.endsWith('.pdf'))
                .filter(file => !file.path.startsWith('__MACOSX'))
                .map(async file => {
                    let pdfPathParts = file.path.split('/');
                    if (pdfPathParts[0] === fileName) {
                        pdfPathParts = pdfPathParts.slice(1);
                    }

                    const name = pdfPathParts.join(' - ');

                    await admin.firestore().collection(`bands/${bandId}/pdfs`).add({name: name});

                    await new Promise((resolve, reject) => {
                        file.stream()
                            .pipe(bucket.file(`bands/${bandId}/input/${name}`).createWriteStream())
                            .on('error', reject)
                            .on('finish', resolve)

                    });
                })
        );

        // Clean up
        await bucket.file(filePath).delete();
        await fs.remove(`/tmp/${fileName}.zip`);
    } catch (err) {
        console.log(err);
    }
});

// Converts PDF to images, add images to Storage and add Storage image-urls to Firestore.
exports.addPDF = functions.storage.object().onChange(async event => {
    const object = event.data;

    if (object.resourceState === 'not_exists') return null;

    // Full file path (bands/<bandId>/input/<fileName>.pdf)
    const filePath = object.name;

    if (!filePath.endsWith('.pdf')) return null;

    const pdfPathParts = filePath.split('/');

    if (pdfPathParts[0] !== 'bands' || pdfPathParts[2] !== 'input') return null;

    const bandId = pdfPathParts[1];

    // File name without extension
    const fileName = path.basename(filePath, '.pdf');

    // Create storage bucket
    const bucket = storage.bucket(object.bucket);

    try {
        // Download to local directory
        await bucket.file(filePath).download({destination: `/tmp/${fileName}.pdf`});

        // Create output directory
        await fs.ensureDir(`/tmp/output`);

        // Generate thumbnail
        await spawn('ghostscript/bin/./gs', [
            '-dBATCH',
            '-dNOPAUSE',
            '-sDEVICE=pngmono',
            `-sOutputFile=/tmp/output/${fileName}-%00d.png`,
            '-r300',
            `/tmp/${fileName}.pdf`
        ]);

        // Add document
        const docRef = await admin.firestore().collection(`bands/${bandId}/pdfs`).add({
            name: fileName,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Read output directory
        const imageFileNames = await fs.readdir(`/tmp/output`);

        // Upload images
        const uploadResponses = await Promise.all(
            imageFileNames.map((name, index) =>
                bucket.upload(`/tmp/output/${name}`, {
                    destination: `bands/${bandId}/pdfs/${docRef.id}/${index}.png`,
                    metadata: {
                        contentType: 'image/png'
                    }
                })
            ));

        // Get urls
        const urlResponses = await Promise.all(
            uploadResponses.map(([file]) =>
                file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491'
                })
            )
        );

        // Add pages to document
        await docRef.update({pages: urlResponses.map(([url]) => url)});

        // Clean up
        await Promise.all([fs.remove(`/tmp/${fileName}.pdf`), fs.remove(`/tmp/output`)]);
        await bucket.file(filePath).delete();
    } catch (err) {
        console.log(err);
    }
});
