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
const request = require("request-promise-native");
admin.initializeApp();
const storage = new Storage({ keyFilename: 'service-account-key.json' });
// Extracts ZIP with pdfs
exports.extractZip = functions.storage.object().onFinalize((object, context) => __awaiter(this, void 0, void 0, function* () {
    // Full file path (<bandId>/<fileName>.pdf)
    const filePath = object.name;
    if (!filePath.endsWith('.zip'))
        return null;
    let [bandId, fileNameExt] = filePath.split('/');
    // File name without extension
    const fileName = path.basename(fileNameExt, '.zip');
    // Create storage bucket
    const bucket = storage.bucket(object.bucket);
    try {
        // Download to local directory
        yield bucket.file(filePath).download({ destination: '/tmp/file.zip' });
        yield bucket.file(filePath).delete();
        // Unzip
        const dir = yield unzipper.Open.file('/tmp/file.zip');
        yield Promise.all(dir.files
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
                    .pipe(bucket.file(`${bandId}/${name}`).createWriteStream())
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
exports.convertPDF = functions.storage.object().onFinalize((object, context) => __awaiter(this, void 0, void 0, function* () {
    //const object = event.data;
    //if (object.resourceState === 'not_exists') return null;
    // Full file path (<bandId>/<fileName>.pdf)
    const filePath = object.name;
    if (!filePath.endsWith('.pdf'))
        return null;
    let [bandId, fileNameExt] = filePath.split('/');
    // File name without extension
    const fileName = path.basename(fileNameExt, '.pdf');
    // Create storage bucket
    const inputBucket = storage.bucket(object.bucket);
    const pdfBucket = storage.bucket('gs://scores-bc679.appspot.com');
    try {
        // Download to local directory
        yield inputBucket.file(filePath).download({ destination: '/tmp/score.pdf' });
        // Delete PDF file
        yield inputBucket.file(filePath).delete();
        // Create output directories
        yield fs.ensureDir('/tmp/output-original');
        yield fs.ensureDir('/tmp/output-cropped');
        yield fs.ensureDir('/tmp/output-cropped-compressed');
        const pdfInfo = yield new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const promise = child_process_promise_1.spawn('xpdf/pdfinfo', [
                '-cfg', '/tmp/.xpdfrc',
                '/tmp/score.pdf',
            ]);
            promise.childProcess.stdout.on('data', _data => {
                promise.childProcess.kill();
                resolve(_data.toString());
            });
            yield promise;
        }));
        const match = /Pages:[ ]+(\d+)/.exec(pdfInfo);
        // Create document
        const pdfRef = yield admin.firestore().collection(`bands/${bandId}/pdfs`).add({
            name: fileName,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
            pageCount: parseInt(match[1]),
            processing: true
        });
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
            const uploadResponses = yield Promise.all(fileNames.map((name, index) => pdfBucket.upload(`/tmp/output-${outputType}/${name}`, {
                destination: `${bandId}/${pdfRef.id}/${outputType}/${index}.png`,
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
        // Analyze PDF
        yield fs.writeFile('/tmp/.xpdfrc', '');
        const process2 = yield child_process_promise_1.spawn('xpdf/pdftotext', [
            '-cfg', '/tmp/.xpdfrc',
            '/tmp/score.pdf',
        ]);
        process2.childProcess.kill();
        const data = {
            processing: admin.firestore.FieldValue.delete(),
            thumbnailURL: croppedPageUrls[0],
            pages: pages,
        };
        const pdfText = yield fs.readFile('/tmp/score.txt', 'latin1');
        if (true) {
            //(pdfText.includes('jazzbandcharts')) {
            // const excludePattern = /(vox\.|[bat]\. sx|tpt|tbn|pno|d\.s\.)/ig;
            const patterns = [{
                    name: 'Score',
                    expr: /(: )?score/i
                }, {
                    name: 'Vocal',
                    expr: /(\w )?vocal/i
                }, {
                    name: 'Alto Sax',
                    expr: /(\w )?alto sax\. \d/i
                }, {
                    name: 'Tenor Sax',
                    expr: /(\w )?tenor sax\. \d/i
                }, {
                    name: 'Baritone Sax',
                    expr: /(\w )?baritone sax\./i
                }, {
                    name: 'Trumpet',
                    expr: /(\w )?trumpet .{0,6}\d/i
                }, {
                    name: 'Trombone',
                    expr: /(\w )?trombone \d/i
                }, {
                    name: 'Guitar',
                    expr: /(\w )?guitar/i
                }, {
                    name: 'Piano',
                    expr: /(\w )?piano/i
                }, {
                    name: 'Bass',
                    expr: /(\w )?bass/i
                }, {
                    name: 'Drum Set',
                    expr: /(\w )?drum set/i
                }];
            const _pages = pdfText.split('\f');
            const snapshot = yield admin.firestore().collection('instruments').get();
            const instruments = snapshot.docs.map(doc => (Object.assign({}, doc.data(), { ref: doc.ref })));
            const parts = [{
                    page: 2,
                    instruments: [admin.firestore().doc('instruments/YFNsZF5GxxpkfBqtbouy')]
                }];
            const nameCount = {};
            for (let i = 3; i < _pages.length; i++) {
                const page = _pages[i];
                // const mExclude = excludePattern.test(page);
                const detectedInstrNames = [];
                // if (!mExclude) {
                for (let pattern of patterns) {
                    const isMatch = pattern.expr.test(page);
                    if (isMatch &&
                        /*Simulate negative lookbehind*/
                        !pattern.expr.exec(page)[1]) {
                        detectedInstrNames.push(pattern.name);
                    }
                }
                // }
                if (detectedInstrNames.length > 0) {
                    if (detectedInstrNames.length === 1) {
                        const [name] = detectedInstrNames;
                        if (['Alto Sax', 'Tenor Sax', 'Trumpet', 'Trombone'].indexOf(name) > -1) {
                            if (!nameCount[name]) {
                                nameCount[name] = 0;
                            }
                            const instrRef = instruments.find(instr => instr['name'] === `${name} ${nameCount[name] + 1}`).ref;
                            parts.push({
                                page: i,
                                instruments: [instrRef]
                            });
                            nameCount[name] += 1;
                        }
                        else {
                            const instrRef = instruments.find(instr => instr['name'] === name).ref;
                            parts.push({
                                page: i,
                                instruments: [instrRef]
                            });
                        }
                    }
                    else {
                        const instrRefs = detectedInstrNames.map(name => instruments.find(instr => instr['name'] === name).ref);
                        parts.push({
                            page: i,
                            instruments: instrRefs
                        });
                    }
                }
            }
            data['parts'] = parts;
        }
        yield pdfRef.update(data);
        // Clean up
        yield Promise.all([
            fs.remove('/tmp/score.txt'),
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
    const bucket = storage.bucket('gs://scores-bc679.appspot.com');
    yield bucket.file(`bands/${bandId}/pdfs/${pdfId}/combinedImage.png`).download({ destination: '/tmp/image.png' });
    const client = new vision.ImageAnnotatorClient();
    const response = yield client.textDetection('/tmp/image.png');
    const detections = response[0];
    yield res.json(detections);
}));
exports.generatePDF = functions.https.onRequest((req, res) => __awaiter(this, void 0, void 0, function* () {
    const bucket = storage.bucket('gs://scores-bc679.appspot.com');
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
        const bucket = storage.bucket('scores-bc679.appspot.com');
        yield bucket.file(`${bandId}/${Math.random().toString().slice(2)}.zip`).save(response.fileBinary);
        res.status(200).send();
    }));
});
exports.updatePartCount = functions.firestore.document('bands/{bandId}/scores/{scoreId}/parts/{partId}').onWrite((change, context) => __awaiter(this, void 0, void 0, function* () {
    const partRef = change.after.ref.parent.parent;
    const partCount = (yield partRef.collection('parts').get()).size;
    yield partRef.update({ partCount: partCount });
}));
exports.createThumbnail = functions.firestore.document('bands/{bandId}/scores/{scoreId}').onCreate((snap, context) => __awaiter(this, void 0, void 0, function* () {
    const data = snap.data();
    if (data.composer) {
        const response = yield request({
            uri: `https://www.googleapis.com/customsearch/v1?key=AIzaSyCufxroiY-CPDEHoprY0ESDpWnFcHICioQ&cx=015179294797728688054:y0lepqsymlg&q=${data.composer}&searchType=image`,
            json: true
        });
        yield snap.ref.update({ thumbnailURL: response.items[0].link });
    }
}));
//# sourceMappingURL=index.js.map