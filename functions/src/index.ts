import * as functions from 'firebase-functions';
import * as path from 'path';
import * as Storage from '@google-cloud/storage';
import {spawn, exec} from 'child-process-promise';
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

        // Create output directories
        await fs.ensureDir(`/tmp/output-original`);
        await fs.ensureDir(`/tmp/output-cropped`);

        // Generate images
        const gsProcess = await spawn('ghostscript/bin/./gs', [
            '-dBATCH',
            '-dNOPAUSE',
            '-sDEVICE=pngmono',
            `-sOutputFile=/tmp/output-original/${fileName}-%03d.png`,
            '-r300',
            `/tmp/${fileName}.pdf`
        ]);

        gsProcess.childProcess.kill();

        const mogrifyProcess = await spawn('mogrify', [
            '-crop', '5000x666+0+0',
            '-resize', '50%',
            '-path', '../output-cropped',
            '*.png'
        ], {cwd: '/tmp/output-original'});

        mogrifyProcess.childProcess.kill();

        // Add document
        const docRef = await admin.firestore().collection(`bands/${bandId}/pdfs`).add({
            name: fileName,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const upload = async outputType => {
            // Read files
            let fileNames = await fs.readdir(`/tmp/output-${outputType}`);

            // Upload files
            let uploadResponses = await Promise.all(
                fileNames.map((name, index) =>
                    bucket.upload(`/tmp/output-${outputType}/${name}`, {
                        destination: `bands/${bandId}/pdfs/${docRef.id}/${outputType}/${index}.png`,
                        metadata: {
                            contentType: 'image/png'
                        }
                    })
                ));

            // Generate urls
            let urlResponses = await Promise.all(
                uploadResponses.map(([file]) =>
                    file.getSignedUrl({
                        action: 'read',
                        expires: '03-09-2491'
                    })
                )
            );

            // Add pages to document
            await docRef.update({[`pages${outputType[0].toUpperCase()}${outputType.slice(1)}`]: urlResponses.map(([url]) => url)});
        };

        await upload('original');
        await upload('cropped');

        // Clean up
        await Promise.all([
            fs.remove(`/tmp/${fileName}.pdf`),
            fs.remove(`/tmp/output-original`),
            fs.remove(`/tmp/output-cropped`)
        ]);
        await bucket.file(filePath).delete();
    } catch (err) {
        console.log(err);
    }
});
