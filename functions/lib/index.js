"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const path = require("path");
const Storage = require("@google-cloud/storage");
const fs = require("fs-extra");
const admin = require("firebase-admin");
const unzipper = require("unzipper");
admin.initializeApp(functions.config().firebase);
const storage = Storage({ keyFilename: 'service-account-key.json' });
exports.extractZip = functions.storage.object().onChange((event) => __awaiter(this, void 0, void 0, function* () {
    const object = event.data;
    if (object.resourceState === 'not_exists')
        return null;
    // Full file path (bands/<bandId>/input/<fileName>.zip)
    const filePath = object.name;
    if (!filePath.endsWith('.zip'))
        return null;
    const parts = filePath.split('/');
    if (parts.length !== 4)
        return null;
    if (parts[0] !== 'bands' || parts[2] !== 'input')
        return null;
    const bandId = parts[1];
    // File name without extension
    const fileName = path.basename(filePath, '.zip');
    // Create storage bucket
    const bucket = storage.bucket(object.bucket);
    try {
        // Download to local directory
        yield bucket.file(filePath).download({ destination: `/tmp/${fileName}.zip` });
        // Unzip
        const dir = yield unzipper.Open.file(`/tmp/${fileName}.zip`);
        yield Promise.all(dir.files
            .filter(file => !file.path.startsWith('__MACOSX'))
            .filter(file => file.path.endsWith('.pdf'))
            .map((file) => __awaiter(this, void 0, void 0, function* () {
            const name = file.path.split('/').join(' - ');
            yield admin.firestore().collection(`bands/${bandId}/pdfs`).add({ name: name });
            yield new Promise((resolve, reject) => {
                file.stream()
                    .pipe(bucket.file(`bands/${bandId}/pdfs/${name}`).createWriteStream())
                    .on('error', reject)
                    .on('finish', resolve);
            });
        })));
        // Clean up
        yield fs.remove(`/tmp/${fileName}.zip`);
    }
    catch (err) {
        console.log(err);
    }
}));
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
//# sourceMappingURL=index.js.map