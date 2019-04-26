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
const request = require("request-promise-native");
// import * as firebase from 'firebase';
admin.initializeApp();
const storage = new Storage({ keyFilename: 'service-account-key.json' });
// Function made just for updating Firebase instruments collection with instruments.
// TO USE IT: Uncomment the code and change instrumentCheck in firebase to true.
// exports.makeInstrumentList = functions.storage.object().onFinalize(async (object, context) => {
//     // This only runs when instrumentCheck is true
//     const instCheckRef = await admin.firestore().collection(`instrumentcheck`).doc('instrumentCheck');
//     const checked = (await instCheckRef.get()).data().checked;
//     const instruments = ['Trombone', 'Trumpet', 'Bass Trombone', 'Alt Sax', 'Tenor Sax',
//         'Baryton Sax', 'Piano', 'Drums', 'Guitar', 'Bass', 'Flute', 'Piccolo Flute', 'Clarinet',
//         'Walthorn', 'Cornet', 'Euphonium', 'Tuba']
//     if (checked) {
//         for (let inst in instruments) {
//             for (let i = 1; i <= 4; i++) {
//                 const instList = await admin.firestore().collection(`instruments`).add({
//                     displayName: `${i}. ${instruments[inst]}`,
//                     name: `${instruments[inst]} ${i}`,
//                     type: instruments[inst],
//                     voice: i
//                 });
//             }
//         }
//         // Secures that this function only runs once
//         const instUpdate = instCheckRef.update({
//             checked: false
//         });
//     }
// });
//Converts PDF to images, add images to Storage and add Storage image-urls to Firestore.
exports.convertPDF = functions.storage.object().onFinalize((object, context) => __awaiter(this, void 0, void 0, function* () {
    const filePath = object.name;
<<<<<<< HEAD
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
        // HUSK Å KOMMENTERE HVA DENNE GJØR
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
=======
    if (filePath.endsWith('.zip')) {
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
>>>>>>> 0cc247149a6d81f7f04c0386f07af39a997da31d
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
<<<<<<< HEAD
        // Analyze PDF
        yield fs.writeFile('/tmp/.xpdfrc', '');
        const process2 = yield child_process_promise_1.spawn('xpdf/pdftotext', [
            '-cfg', '/tmp/.xpdfrc',
            '/tmp/score.pdf',
        ]);
        process2.childProcess.kill();
        console.log('process2', process2);
        const data = {
            processing: admin.firestore.FieldValue.delete(),
            thumbnailURL: croppedPageUrls[0],
            pages: pages,
        };
        const pdfText = yield fs.readFile('/tmp/score.txt', 'latin1');
        console.log('pdfText', pdfText);
        if (true) {
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
            // Pattern for filtering out arranger and composer
            const arrangerPattern = /[\\n\r]*Arranged by\s*([^\n\r]*)/g;
            const composerPattern = /[\\n\r]*Words and Music by\s*([^\n\r]*)/g;
            // Splits the pdf into pages with ekstra blank page
            let _pages = pdfText.split('\f');
            console.log('Pages:', _pages);
            console.log('PagesLength', _pages.length);
            const snapshot = yield admin.firestore().collection('instrumentList').get();
            const instruments = snapshot.docs.map(doc => ({ name: doc.data().name, ref: doc.ref }));
            const instrmList = [];
            for (let i in instruments) {
                instrmList.push((instruments[i].name).toUpperCase());
            }
            ;
            const parts = [];
            // Checks if arranger exists on the pdfs first page
            let arrangerName = 'No arranger detected';
            const arrangerResult = arrangerPattern.exec(_pages[0]);
            if (arrangerResult !== null) {
                arrangerName = arrangerResult[1];
                arrangerName = arrangerName.toLowerCase();
                arrangerName = arrangerName.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
            }
            ;
            // Checks if composer exists on the pdfs first page
            let composerName = 'No composer detected';
            const composerResult = yield composerPattern.exec(_pages[0]);
            if (composerResult !== null) {
                composerName = composerResult[1];
                composerName = composerName.toLowerCase();
                composerName = composerName.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
            }
            ;
            // GOING THROUGH EVERY PAGE IN THE PDF
            for (let i = 0; i < _pages.length - 1; i++) {
                const page = _pages[i];
                console.log('page', page);
                const detectedInstrNames = [];
                for (let pattern of patterns) {
                    const patternMatch = pattern.expr.test(page);
                    // Simulate negative lookbehind
                    if (patternMatch && !pattern.expr.exec(page)[1]) {
                        detectedInstrNames.push(pattern.expr.exec(page)[0]);
=======
        catch (err) {
            console.log(err);
        }
    }
    else if (filePath.endsWith('.pdf')) {
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
            // HUSK Å KOMMENTERE HVA DENNE GJØR
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
>>>>>>> 0cc247149a6d81f7f04c0386f07af39a997da31d
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
console.log('process2', process2);
const data = {
    processing: admin.firestore.FieldValue.delete(),
    thumbnailURL: croppedPageUrls[0],
    pages: pages,
};
const pdfText = yield fs.readFile('/tmp/score.txt', 'latin1');
console.log('pdfText', pdfText);
if (true) {
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
    // Pattern for filtering out arranger and composer
    const arrangerPattern = /[\\n\r]*Arranged by\s*([^\n\r]*)/g;
    const composerPattern = /[\\n\r]*Words and Music by\s*([^\n\r]*)/g;
    // Splits the pdf into pages with ekstra blank page
    let _pages = pdfText.split('\f');
    console.log('Pages:', _pages);
    console.log('PagesLength', _pages.length);
    const snapshot = yield admin.firestore().collection('instruments').get();
    const instruments = snapshot.docs.map(doc => ({ name: doc.data().name, ref: doc.ref }));
    const instrmList = [];
    for (let i in instruments) {
        instrmList.push((instruments[i].name).toUpperCase());
    }
    ;
    const parts = [];
    // Checks if arranger exists on the pdfs first page
    let arrangerName = 'No arranger detected';
    const arrangerResult = arrangerPattern.exec(_pages[0]);
    if (arrangerResult !== null) {
        arrangerName = arrangerResult[1];
        arrangerName = arrangerName.toLowerCase();
        arrangerName = arrangerName.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    }
    ;
    // Checks if composer exists on the pdfs first page
    let composerName = 'No composer detected';
    const composerResult = yield composerPattern.exec(_pages[0]);
    if (composerResult !== null) {
        composerName = composerResult[1];
        composerName = composerName.toLowerCase();
        composerName = composerName.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    }
    ;
    // GOING THROUGH EVERY PAGE IN THE PDF
    for (let i = 0; i < _pages.length - 1; i++) {
        const page = _pages[i];
        console.log('page', page);
        const detectedInstrNames = [];
        for (let pattern of patterns) {
            const patternMatch = pattern.expr.test(page);
            // Simulate negative lookbehind
            if (patternMatch && !pattern.expr.exec(page)[1]) {
                detectedInstrNames.push(pattern.expr.exec(page)[0]);
            }
        }
        // IF ANY NAMES WHERE DETECTED
        if (detectedInstrNames.length > 0) {
            const [name] = detectedInstrNames;
            console.log('Instrument: ', name);
            // IF THE NAME IS IN THE INSTRUMENT LIST
            if (instrmList.indexOf(name) > -1) {
                const instrRef = instruments[instrmList.indexOf(name)].ref;
                parts.push({
                    page: i + 1,
                    instrument: [instrRef]
                });
            }
            else {
                parts.push({
                    page: i + 1,
                    instrument: [instruments[instrmList.indexOf("NO INSTRUMENTS DETECTED")].ref]
                });
            }
        }
        else {
            parts.push({
                page: i + 1,
                instrument: [instruments[instrmList.indexOf("NO INSTRUMENTS DETECTED")].ref]
            });
        }
    }
    data['parts'] = parts;
    data['arranger'] = arrangerName;
    data['composer'] = composerName;
    console.log('Data', data);
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
    }
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