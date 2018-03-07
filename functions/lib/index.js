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
const child_process_promise_1 = require("child-process-promise");
const fs = require("fs-extra");
const admin = require("firebase-admin");
const unzipper = require("unzipper");
admin.initializeApp(functions.config().firebase);
const storage = Storage({ keyFilename: 'service-account-key.json' });
// Extracts ZIP with pdfs
exports.extractZip = functions.storage.object().onChange((event) => __awaiter(this, void 0, void 0, function* () {
    const object = event.data;
    if (object.resourceState === 'not_exists')
        return null;
    // Full file path (bands/<bandId>/input/<fileName>.zip)
    const filePath = object.name;
    if (!filePath.endsWith('.zip'))
        return null;
    const zipPathParts = filePath.split('/');
    if (zipPathParts[0] !== 'bands' || zipPathParts[2] !== 'input')
        return null;
    const bandId = zipPathParts[1];
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
            .filter(file => !file.path.endsWith('/'))
            .filter(file => file.path.endsWith('.pdf'))
            .filter(file => !file.path.startsWith('__MACOSX'))
            .map((file) => __awaiter(this, void 0, void 0, function* () {
            let pdfPathParts = file.path.split('/');
            if (pdfPathParts[0] === fileName) {
                pdfPathParts = pdfPathParts.slice(1);
            }
            const name = pdfPathParts.join(' - ');
            yield admin.firestore().collection(`bands/${bandId}/pdfs`).add({ name: name });
            yield new Promise((resolve, reject) => {
                file.stream()
                    .pipe(bucket.file(`bands/${bandId}/input/${name}`).createWriteStream())
                    .on('error', reject)
                    .on('finish', resolve);
            });
        })));
        // Clean up
        yield bucket.file(filePath).delete();
        yield fs.remove(`/tmp/${fileName}.zip`);
    }
    catch (err) {
        console.log(err);
    }
}));
// Converts PDF to images, add images to Storage and add Storage image-urls to Firestore.
exports.addPDF = functions.storage.object().onChange((event) => __awaiter(this, void 0, void 0, function* () {
    const object = event.data;
    if (object.resourceState === 'not_exists')
        return null;
    // Full file path (bands/<bandId>/input/<fileName>.pdf)
    const filePath = object.name;
    if (!filePath.endsWith('.pdf'))
        return null;
    const pdfPathParts = filePath.split('/');
    if (pdfPathParts[0] !== 'bands' || pdfPathParts[2] !== 'input')
        return null;
    const bandId = pdfPathParts[1];
    // File name without extension
    const fileName = path.basename(filePath, '.pdf');
    // Create storage bucket
    const bucket = storage.bucket(object.bucket);
    try {
        // Download to local directory
        yield bucket.file(filePath).download({ destination: `/tmp/${fileName}.pdf` });
        // Create output directories
        yield fs.ensureDir(`/tmp/output-original`);
        yield fs.ensureDir(`/tmp/output-cropped`);
        // Generate images
        const gsProcess = yield child_process_promise_1.spawn('ghostscript/bin/./gs', [
            '-dBATCH',
            '-dNOPAUSE',
            '-sDEVICE=pngmono',
            `-sOutputFile=/tmp/output-original/${fileName}-%03d.png`,
            '-r300',
            `/tmp/${fileName}.pdf`
        ]);
        gsProcess.childProcess.kill();
        const mogrifyProcess = yield child_process_promise_1.spawn('mogrify', [
            '-crop', '5000x666+0+0',
            '-resize', '50%',
            '-path', '../output-cropped',
            '*.png'
        ], { cwd: '/tmp/output-original' });
        mogrifyProcess.childProcess.kill();
        // Add document
        const docRef = yield admin.firestore().collection(`bands/${bandId}/pdfs`).add({
            name: fileName,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        const upload = (outputType) => __awaiter(this, void 0, void 0, function* () {
            // Read files
            let fileNames = yield fs.readdir(`/tmp/output-${outputType}`);
            // Upload files
            let uploadResponses = yield Promise.all(fileNames.map((name, index) => bucket.upload(`/tmp/output-${outputType}/${name}`, {
                destination: `bands/${bandId}/pdfs/${docRef.id}/${outputType}/${index}.png`,
                metadata: {
                    contentType: 'image/png'
                }
            })));
            // Generate urls
            let urlResponses = yield Promise.all(uploadResponses.map(([file]) => file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            })));
            // Add pages to document
            yield docRef.update({ [`pages${outputType[0].toUpperCase()}${outputType.slice(1)}`]: urlResponses.map(([url]) => url) });
        });
        yield upload('original');
        yield upload('cropped');
        // Clean up
        yield Promise.all([
            fs.remove(`/tmp/${fileName}.pdf`),
            fs.remove(`/tmp/output-original`),
            fs.remove(`/tmp/output-cropped`)
        ]);
        yield bucket.file(filePath).delete();
    }
    catch (err) {
        console.log(err);
    }
}));
//# sourceMappingURL=index.js.map