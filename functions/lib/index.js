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
const PDFDocument = require("pdfkit");
const vision = require("@google-cloud/vision");
require("isomorphic-fetch");
const dropbox_1 = require("dropbox");
const cors = require("cors");
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
        yield bucket.file(filePath).download({ destination: '/tmp/file.zip' });
        yield bucket.file(filePath).delete();
        // Unzip
        const dir = yield unzipper.Open.file('/tmp/file.zip');
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
            yield new Promise((resolve, reject) => {
                file.stream()
                    .pipe(bucket.file(`bands/${bandId}/input/${name}`).createWriteStream())
                    .on('error', reject)
                    .on('finish', resolve);
            });
        })));
        // Clean up
        yield fs.remove('/tmp/file.zip');
    }
    catch (err) {
        console.log(err);
    }
}));
//Converts PDF to images, add images to Storage and add Storage image-urls to Firestore.
exports.convertPDF = functions.storage.object().onChange((event) => __awaiter(this, void 0, void 0, function* () {
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
    const inputBucket = storage.bucket(object.bucket);
    const outputBucket = storage.bucket('scores-butler-bands');
    // Create document
    const pdfRef = yield admin.firestore().collection(`bands/${bandId}/pdfs`).add({
        name: fileName,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        processing: true
    });
    try {
        // Download to local directory
        yield inputBucket.file(filePath).download({ destination: '/tmp/score.pdf' });
        // Delete PDF file
        yield inputBucket.file(filePath).delete();
        // Create output directories
        yield fs.ensureDir('/tmp/output-original');
        yield fs.ensureDir('/tmp/output-cropped');
        yield fs.ensureDir('/tmp/output-cropped-compressed');
        // Generate images
        const gsProcess = yield child_process_promise_1.spawn('ghostscript/bin/./gs', [
            '-dBATCH',
            '-dNOPAUSE',
            '-sDEVICE=pngmonod',
            `-sOutputFile=/tmp/output-original/score-%03d.png`,
            '-r300',
            `/tmp/score.pdf`
        ]);
        gsProcess.childProcess.kill();
        console.log('PDF conversion complete!');
        const convertProcess = yield child_process_promise_1.spawn('mogrify', [
            '-crop', '4000x666+0+0',
            '-resize', '40%',
            '-path', '../output-cropped',
            '*.png'
        ], { cwd: '/tmp/output-original/' });
        console.log('Image crop complete!');
        convertProcess.childProcess.kill();
        const upload = (outputType) => __awaiter(this, void 0, void 0, function* () {
            // Read files
            const fileNames = yield fs.readdir(`/tmp/output-${outputType}`);
            // Upload files
            const uploadResponses = yield Promise.all(fileNames.map((name, index) => outputBucket.upload(`/tmp/output-${outputType}/${name}`, {
                destination: `bands/${bandId}/pdfs/${pdfRef.id}/${outputType}/${index}.png`,
                metadata: {
                    contentType: 'image/png'
                }
            })));
            // Generate urls
            return yield Promise.all(uploadResponses.map(([file]) => file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            })));
        });
        const croppedPageUrls = (yield upload('cropped')).map(([url]) => url);
        const originalPageUrls = (yield upload('original')).map(([url]) => url);
        // Add page documents
        const pages = [];
        for (let i = 0; i < croppedPageUrls.length; i++) {
            pages.push({
                croppedURL: croppedPageUrls[i],
                originalURL: originalPageUrls[i]
            });
        }
        yield pdfRef.update({
            processing: admin.firestore.FieldValue.delete(),
            thumbnailURL: croppedPageUrls[0],
            pages: pages
        });
        // Clean up
        yield Promise.all([
            fs.remove('/tmp/score.pdf'),
            fs.remove('/tmp/output-original'),
            fs.remove('/tmp/output-cropped'),
        ]);
    }
    catch (err) {
        console.log(err);
    }
}));
exports.analyzePDF = functions.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    const { bandId, pdfId } = req.query;
    const bucket = storage.bucket('scores-butler.appspot.com');
    yield bucket.file(`bands/${bandId}/pdfs/${pdfId}/combinedImage.png`).download({ destination: '/tmp/image.png' });
    const client = new vision.ImageAnnotatorClient();
    const response = yield client.textDetection('/tmp/image.png');
    const detections = response[0];
    yield res.json(detections);
}));
exports.generatePDF = functions.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    const bucket = storage.bucket('scores-butler.appspot.com');
    const doc = new PDFDocument();
    const image = '';
    const file = bucket.file('test/test.pdf');
    yield file.setMetadata({ contentType: 'application/pdf' });
    const writeStream = file.createWriteStream();
    doc.pipe(writeStream);
    doc.image(image, 0, 0);
    doc.end();
    writeStream.on('finish', () => __awaiter(this, void 0, void 0, function* () {
        res.status(200).send();
    }));
}));
exports.uploadFromDropbox = functions.https.onRequest((req, res) => {
    return cors({ origin: true })(req, res, () => __awaiter(this, void 0, void 0, function* () {
        const { bandId, folderPath, accessToken } = req.query;
        const dropbox = new dropbox_1.Dropbox({ accessToken: accessToken });
        const response = yield dropbox.filesDownloadZip({ path: folderPath });
        const bucket = storage.bucket('scores-butler.appspot.com');
        yield bucket.file(`bands/${bandId}/input/${Math.random().toString().slice(2)}.zip`).save(response.fileBinary);
        res.status(200).send();
    }));
});
exports.extractPDF = functions.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    const bucket = storage.bucket('scores-butler.appspot.com');
    yield bucket.file('Aint That A Kick - Complete.pdf').download({ destination: '/tmp/score.pdf' });
    yield fs.writeFile('/tmp/.xpdfrc', '');
    // const promise = spawn('xpdf/pdfinfo', [
    //     '-cfg', '/tmp/.xpdfrc',
    //     '/tmp/score.pdf',
    // ]);
    //
    // promise.childProcess.stdout.on('data', data => {
    //     res.status(200).send(data.toString());
    // });
    //
    // await promise;
    // process1.childProcess.kill();
    const process2 = yield child_process_promise_1.spawn('xpdf/pdftotext', [
        '-raw',
        '-cfg', '/tmp/.xpdfrc',
        '/tmp/score.pdf',
    ]);
    process2.childProcess.kill();
    const data = yield fs.readFile('/tmp/score.txt', 'latin1');
    res.status(200).json([data]);
}));
exports.updatePartCount = functions.firestore
    .document('bands/{bandId}/scores/{scoreId}/parts/{partId}').onWrite((event) => __awaiter(this, void 0, void 0, function* () {
    const partRef = event.data.ref.parent.parent;
    const partCount = (yield partRef.collection('parts').get()).size;
    yield partRef.update({ partCount: partCount });
}));
//# sourceMappingURL=index.js.map