import * as functions from 'firebase-functions';
import * as path from 'path';
import * as Storage from '@google-cloud/storage';

import { spawn } from 'child-process-promise';
import * as fs from 'fs-extra';
import * as admin from 'firebase-admin';
import * as unzipper from 'unzipper';
import * as PDFDocument from 'pdfkit';
import * as vision from '@google-cloud/vision';
import 'isomorphic-fetch';
import { Dropbox } from 'dropbox';
import * as cors from 'cors';
import * as request from 'request-promise-native';

admin.initializeApp();

const storage = new Storage({ keyFilename: 'service-account-key.json' });

// Extracts ZIP with pdfs
// exports.extractZip = functions.storage.object().onFinalize(async (object, context) => {
//     // Full file path (<bandId>/<fileName>.pdf)
//     const filePath = object.name;

//     if (!filePath.endsWith('.zip')) return null;

//     let [bandId, fileNameExt] = filePath.split('/');

//     // File name without extension
//     const fileName = path.basename(fileNameExt, '.zip');

//     // Create storage bucket
//     const bucket = storage.bucket(object.bucket);

//     try {
//         // Download to local directory
//         await bucket.file(filePath).download({ destination: '/tmp/file.zip' });

//         await bucket.file(filePath).delete();

//         // Unzip
//         const dir = await unzipper.Open.file('/tmp/file.zip');

//         await Promise.all(
//             dir.files
//                 .filter(file => file.path.endsWith('.pdf'))
//                 .filter(file => !file.path.startsWith('__MACOSX'))
//                 .map(async file => {
//                     let pdfPathParts = file.path.split('/');
//                     if (pdfPathParts[0] === fileName) {
//                         pdfPathParts = pdfPathParts.slice(1);
//                     }

//                     const name = pdfPathParts.join(' - ');

//                     await new Promise((resolve, reject) => {
//                         file.stream()
//                             .pipe(bucket.file(`${bandId}/${name}`).createWriteStream())
//                             .on('error', reject)
//                             .on('finish', resolve)

//                     });
//                 })
//         );

//         // Clean up
//         await fs.remove('/tmp/file.zip');
//     } catch (err) {
//         console.log(err);
//     }
// });


// Function made just for updating Firebase instruments collection with instruments
exports.makeInstrumentList = functions.storage.object().onFinalize(async (object, context) => {

    // This only runs when instrumentCheck is true
    const instCheckRef = await admin.firestore().collection(`instrumentcheck`).doc('instrumentCheck');
    const checked = (await instCheckRef.get()).data().checked;
    const instrumentList = ['Trombone', 'Trumpet', 'Bass Trombone', 'Alt Sax', 'Tenor Sax',
        'Baryton Sax', 'Piano', 'Drums', 'Guitar', 'Bass', 'Flute', 'Piccolo Flute', 'Clarinet',
        'Walthorn', 'Cornet', 'Euphonium', 'Tuba']

    if (checked) {
        for (let inst in instrumentList) {
            for (let i = 1; i <= 4; i++) {
                const instList = await admin.firestore().collection(`instrumentList`).add({
                    displayName: `${i}. ${instrumentList[inst]}`,
                    name: `${instrumentList[inst]} ${i}`,
                    type: instrumentList[inst],
                    voice: i
                });
            }
        }

        // Secures that this function only runs once
        const instUpdate = instCheckRef.update({
            checked: false
        });
    }
});


//Converts PDF to images, add images to Storage and add Storage image-urls to Firestore.
exports.convertPDF = functions.storage.object().onFinalize(async (object, context) => {
    const filePath = object.name;

    if (!filePath.endsWith('.pdf')) return null;

    let [bandId, fileNameExt] = filePath.split('/');

    // File name without extension
    const fileName = path.basename(fileNameExt, '.pdf');

    // Create storage bucket
    const inputBucket = storage.bucket(object.bucket);

    const pdfBucket = storage.bucket('gs://scores-bc679.appspot.com');

    try {
        // Download to local directory
        await inputBucket.file(filePath).download({ destination: '/tmp/score.pdf' });

        // Delete PDF file
        await inputBucket.file(filePath).delete();

        // Create output directories
        await fs.ensureDir('/tmp/output-original');
        await fs.ensureDir('/tmp/output-cropped');
        await fs.ensureDir('/tmp/output-cropped-compressed');

        const pdfInfo = await new Promise<string>(async resolve => {
            const promise = spawn('xpdf/pdfinfo', [
                '-cfg', '/tmp/.xpdfrc',
                '/tmp/score.pdf',
            ]);

            promise.childProcess.stdout.on('data', _data => {
                promise.childProcess.kill();
                resolve(_data.toString());
            });

            await promise;
        });
        const match = /Pages:[ ]+(\d+)/.exec(pdfInfo);

        // Create document
        const pdfRef = await admin.firestore().collection(`bands/${bandId}/pdfs`).add({
            name: fileName,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
            pageCount: parseInt(match[1]),
            processing: true
        });

        // Generate images
        const gsProcess = await spawn('ghostscript/bin/./gs', [
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
        const convertProcess = await spawn('mogrify', [
            '-crop', '4000x666+0+0',
            '-resize', '40%',
            '-path', '../output-cropped',
            '*.png'
        ], { cwd: '/tmp/output-original/' });

        console.log('Image crop complete!');

        convertProcess.childProcess.kill();

        const upload = async outputType => {
            // Read files
            const fileNames = await fs.readdir(`/tmp/output-${outputType}`);

            const uploadResponses = await Promise.all(
                fileNames.map((name, index) =>
                    pdfBucket.upload(`/tmp/output-${outputType}/${name}`, {
                        destination: `${bandId}/${pdfRef.id}/${outputType}/${index}.png`,
                        metadata: {
                            contentType: 'image/png'
                        }
                    })
                ));

            // Generate urls
            return await Promise.all(
                uploadResponses.map(([file]) =>
                    file.getSignedUrl({
                        action: 'read',
                        expires: '03-09-2491'
                    })
                )
            );
        };

        const croppedPageUrls = (await upload('cropped')).map(([url]) => url);
        const originalPageUrls = (await upload('original')).map(([url]) => url);

        // Add page documents
        const pages = [];
        for (let i = 0; i < croppedPageUrls.length; i++) {
            pages.push({
                croppedURL: croppedPageUrls[i],
                originalURL: originalPageUrls[i]
            })
        }

        // Analyze PDF
        await fs.writeFile('/tmp/.xpdfrc', '');

        const process2 = await spawn('xpdf/pdftotext', [
            '-cfg', '/tmp/.xpdfrc',
            '/tmp/score.pdf',
        ]);

        process2.childProcess.kill();

        const data = {
            processing: admin.firestore.FieldValue.delete(),
            thumbnailURL: croppedPageUrls[0],
            pages: pages,
        };

        const pdfText = await fs.readFile('/tmp/score.txt', 'latin1');
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

            const snapshot = await admin.firestore().collection('instrumentList').get();
            const instruments = snapshot.docs.map(doc => ({ name: doc.data().name, ref: doc.ref }));

            const instrmList = []
            for (let i in instruments) {
                instrmList.push((instruments[i].name).toUpperCase())
            };

            const parts = [];
            let arrangerName;
            let composerName;

            // Checks if arranger and composer exists on the pdfs first page
            const arrangerMatch = arrangerPattern.test(_pages[0]);
            const composerMatch = composerPattern.test(_pages[0]);
            
            if (arrangerMatch && arrangerPattern.test(_pages[0]) !== null) {
                arrangerName = arrangerPattern.exec(_pages[0])[1];
                arrangerName = arrangerName.toLowerCase()
                arrangerName = arrangerName.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
            };

            if (composerMatch && composerPattern.test(_pages[0]) !== null) {
                composerName = composerPattern.exec(_pages[0])[1];
                composerName = composerName.toLowerCase()
                composerName = composerName.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ')
            };

            console.log('Arranger: ', arrangerName)
            console.log('Composer: ', composerName)

            // GOING THROUGH EVERY PAGE IN THE PDF
            for (let i = 0; i < _pages.length - 1; i++) {
                const page = _pages[i];
                console.log('page', page)

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
                    console.log('Instrument: ', name)

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
                            instrument: 'No instruments detected'
                        });
                    }
                }

                else {
                    parts.push({
                        page: i + 1,
                        instrument: 'No instruments detected',
                    });
                }
            }

            data['parts'] = parts;
            data['arranger'] = arrangerName;
            data['composer'] = composerName;
            console.log('Data', data)
        }

        await pdfRef.update(data);

        // Clean up
        await Promise.all([
            fs.remove('/tmp/score.txt'),
            fs.remove('/tmp/score.pdf'),
            fs.remove('/tmp/output-original'),
            fs.remove('/tmp/output-cropped'),
        ]);
    } catch (err) {
        console.log(err);
    }
});

exports.analyzePDF = functions.https.onRequest(async (req, res) => {
    const { bandId, pdfId } = req.query;

    const bucket = storage.bucket('gs://scores-bc679.appspot.com');

    await bucket.file(`bands/${bandId}/pdfs/${pdfId}/combinedImage.png`).download({ destination: '/tmp/image.png' });

    const client = new vision.ImageAnnotatorClient();

    const response = await client.textDetection('/tmp/image.png');
    const detections = response[0];

    await res.json(detections);
});

exports.generatePDF = functions.https.onRequest(async (req, res) => {
    const bucket = storage.bucket('gs://scores-bc679.appspot.com');

    const doc = new PDFDocument();

    const image = '';

    const file = bucket.file('test/test.pdf');
    await file.setMetadata({ contentType: 'application/pdf' });

    const writeStream = file.createWriteStream();

    doc.pipe(writeStream);
    doc.image(image, 0, 0);
    doc.end();

    writeStream.on('finish', async () => {
        res.status(200).send();
    });
});

exports.uploadFromDropbox = functions.https.onRequest((req, res) => {
    return cors({ origin: true })(req, res, async () => {
        const { bandId, folderPath, accessToken } = req.query;
        const dropbox = new Dropbox({ accessToken: accessToken });
        const response = await dropbox.filesDownloadZip({ path: folderPath }) as any;
        const bucket = storage.bucket('scores-bc679.appspot.com');
        await bucket.file(`${bandId}/${Math.random().toString().slice(2)}.zip`).save(response.fileBinary);
        res.status(200).send();
    });
});

exports.updatePartCount = functions.firestore.document('bands/{bandId}/scores/{scoreId}/parts/{partId}').onWrite(async (change, context) => {
    const partRef = change.after.ref.parent.parent;
    const partCount = (await partRef.collection('parts').get()).size;
    await partRef.update({ partCount: partCount });
});

exports.createThumbnail = functions.firestore.document('bands/{bandId}/scores/{scoreId}').onCreate(async (snap, context) => {
    const data = snap.data();
    if (data.composer) {
        const response = await request({
            uri: `https://www.googleapis.com/customsearch/v1?key=AIzaSyCufxroiY-CPDEHoprY0ESDpWnFcHICioQ&cx=015179294797728688054:y0lepqsymlg&q=${data.composer}&searchType=image`,
            json: true
        });
        await snap.ref.update({ thumbnailURL: response.items[0].link });
    }
});
