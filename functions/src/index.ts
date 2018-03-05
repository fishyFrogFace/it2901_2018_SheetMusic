import * as functions from 'firebase-functions';
import * as path from 'path';
import * as Storage from '@google-cloud/storage';
import {spawn} from 'child-process-promise';
import * as fs from 'fs-extra';
import * as admin from 'firebase-admin';
import * as unzipper from 'unzipper';

admin.initializeApp(functions.config().firebase);

const storage = Storage({keyFilename: 'service-account-key.json'});

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
                            .pipe(bucket.file(`bands/${bandId}/pdfs/${name}`).createWriteStream())
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

// exports.generateImagesFromPDF = functions.storage.object().onChange(async event => {
//     const object = event.data;
//
//     if (object.resourceState === 'not_exists') return null;
//
//     // Full file path (bands/<bandId>/pdfs/<fileName>.pdf)
//     const filePath = object.name;
//
//     if (!filePath.endsWith('.pdf')) return null;
//
//     const parts = filePath.split('/');
//
//     if (parts[0] !== 'bands') return null;
//
//     if (parts.length !== 4) return null;
//
//     const bandId = parts[1];
//
//     // File name without extension (<fileName>)
//     const fileName = path.basename(filePath, '.pdf');
//
//     const outputDir = `bands/${bandId}/unsortedSheets/${fileName}`;
//
//     const localFilePath = `/tmp/${fileName}.pdf`;
//     const localOutputDir = '/tmp/output';
//
//     const bucket = storage.bucket(object.bucket);
//
//     // Create output directory
//     await fs.ensureDir(localOutputDir);
//
//     // Download to local directory
//     await bucket.file(filePath).download({destination: localFilePath});
//
//     // Generate images
//     await new Promise((resolve, reject) => {
//         gs()
//             .batch()
//             .nopause()
//             .executablePath('ghostscript/bin/./gs')
//             .device('pngmono')
//             .res(300)
//             .output(`${localOutputDir}/page-%d`)
//             .input(localFilePath)
//             .exec((err, stdout, stderr) => {
//                 console.log(stdout);
//
//                 if (err) {
//                     console.log(stderr);
//                     reject(err);
//                 } else {
//                     resolve();
//                 }
//             });
//     });
//
//     // Get images
//     const fileNames = await fs.readdir(localOutputDir);
//
//     // Upload images
//     const uploadResponses = await Promise.all(
//         fileNames.map((fileName, index) =>
//             bucket.upload(`${localOutputDir}/${fileName}`, {
//                 destination: `${outputDir}/${index}.png`
//             })
//         ));
//
//     // Get urls
//     const urlResponses = await Promise.all(
//         uploadResponses.map(response =>
//             response[0].getSignedUrl({
//                 action: 'read',
//                 expires: '03-09-2491'
//             })
//         )
//     );
//
//     // Add document
//     await admin.firestore().collection(`bands/${bandId}/unsortedSheets`).add({
//         fileName: fileName,
//         sheets: urlResponses.map(responses => responses[0]),
//         uploadedAt: admin.firestore.FieldValue.serverTimestamp()
//     });
//
//     // Clean up
//     await Promise.all([fs.remove(localFilePath), fs.remove(localOutputDir)]);
// });
