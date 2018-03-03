const path = require('path');
const functions = require('firebase-functions');
const storage = require('@google-cloud/storage')({keyFilename: 'scores-butler-firebase-adminsdk-q3z9b-b842fdbdfd.json'});
const spawn = require('child-process-promise').spawn;
const gs = require('gs');
const fs = require('fs-extra');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.generateImagesFromPDF = functions.storage.object().onChange(event => {
    const object = event.data;

    if (object.resourceState === 'not_exists') return null;

    // Full file path (bands/<bandId>/pdfs/<fileName>.pdf)
    const filePath = object.name;

    if (!filePath.endsWith('.pdf')) return null;

    const parts = filePath.split('/');

    if (parts[0] !== 'bands') return null;

    if (parts.length !== 4) return null;

    const bandId = parts[1];

    // File name without extension (<fileName>)
    const fileName = path.basename(filePath, '.pdf');

    const outputDir = `bands/${bandId}/unsortedSheets/${fileName}`;

    const localFilePath = `/tmp/${fileName}.pdf`;
    const localOutputDir = '/tmp/output';

    const bucket = storage.bucket(object.bucket);

    return Promise.resolve()
        // Create output directory
        .then(() => fs.ensureDir(localOutputDir))
        // Download to local directory
        .then(() => bucket.file(filePath).download({destination: localFilePath}))
        // Generate images
        .then(() => new Promise((resolve, reject) => {
            gs()
                .batch()
                .nopause()
                .executablePath('ghostscript/bin/./gs')
                .device('pngmono')
                .res(300)
                .output(`${localOutputDir}/page-%d`)
                .input(localFilePath)
                .exec((err, stdout, stderr) => {
                    console.log(stdout);

                    if (err) {
                        console.log(stderr);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
        }))
        // Get images
        .then(() => fs.readdir(localOutputDir))
        // Upload images
        .then(fileNames => Promise.all(
            fileNames.map((fileName, index) =>
                bucket.upload(`${localOutputDir}/${fileName}`, {
                    destination: `${outputDir}/${index}.png`,
                    contentType: 'image/png'
                })
            ))
        )
        // Get urls
        .then(uploadResponses =>
            Promise.all(
                uploadResponses.map(response =>
                    response[0].getSignedUrl({
                        action: 'read',
                        expires: '03-09-2491'
                    })
                )
            )
        )
        // Add document
        .then(urlResponses =>
            admin.firestore().collection(`bands/${bandId}/unsortedSheets`).add({
                fileName: fileName,
                sheets: urlResponses.map(responses => responses[0]),
                uploadedAt: admin.firestore.FieldValue.serverTimestamp()
            })
        )
        // Clean up
        .then(() => Promise.all([fs.remove(localFilePath), fs.remove(localOutputDir)]))
        .catch(err => {
            console.log(err);
        });
});




