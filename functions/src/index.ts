import * as functions from 'firebase-functions';
import * as path from 'path';
import * as Storage from '@google-cloud/storage';
import {spawn} from 'child-process-promise';
import * as fs from 'fs-extra';
import * as admin from 'firebase-admin';
import * as unzipper from 'unzipper';
import * as PDFDocument from 'pdfkit';
import * as vision from '@google-cloud/vision';
import 'isomorphic-fetch';
import {Dropbox} from 'dropbox';
import * as cors from 'cors';
import * as request from 'request-promise-native';

admin.initializeApp(functions.config().firebase);

const storage = Storage({keyFilename: 'service-account-key.json'});

// Extracts ZIP with pdfs
exports.extractZip = functions.storage.object().onChange(async event => {
    const object = event.data;

    if (object.resourceState === 'not_exists') return null;

    // Full file path (<bandId>/<fileName>.pdf)
    const filePath = object.name;

    if (!filePath.endsWith('.zip')) return null;

    let [bandId, fileNameExt] = filePath.split('/');

    // File name without extension
    const fileName = path.basename(fileNameExt, '.zip');

    // Create storage bucket
    const bucket = storage.bucket(object.bucket);

    try {
        // Download to local directory
        await bucket.file(filePath).download({destination: '/tmp/file.zip'});

        await bucket.file(filePath).delete();

        // Unzip
        const dir = await unzipper.Open.file('/tmp/file.zip');

        await Promise.all(
            dir.files
                .filter(file => file.path.endsWith('.pdf'))
                .filter(file => !file.path.startsWith('__MACOSX'))
                .map(async file => {
                    let pdfPathParts = file.path.split('/');
                    if (pdfPathParts[0] === fileName) {
                        pdfPathParts = pdfPathParts.slice(1);
                    }

                    const name = pdfPathParts.join(' - ');

                    await new Promise((resolve, reject) => {
                        file.stream()
                            .pipe(bucket.file(`${bandId}/${name}`).createWriteStream())
                            .on('error', reject)
                            .on('finish', resolve)

                    });
                })
        );

        // Clean up
        await fs.remove('/tmp/file.zip');
    } catch (err) {
        console.log(err);
    }
});


//Converts PDF to images, add images to Storage and add Storage image-urls to Firestore.
exports.convertPDF = functions.storage.object().onChange(async event => {
    const object = event.data;

    if (object.resourceState === 'not_exists') return null;

    // Full file path (<bandId>/<fileName>.pdf)
    const filePath = object.name;

    if (!filePath.endsWith('.pdf')) return null;

    let [bandId, fileNameExt] = filePath.split('/');

    // File name without extension
    const fileName = path.basename(fileNameExt, '.pdf');

    // Create storage bucket
    const inputBucket = storage.bucket(object.bucket);

    const pdfBucket = storage.bucket('scores-butler-pdfs');

    try {
        // Download to local directory
        await inputBucket.file(filePath).download({destination: '/tmp/score.pdf'});

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

        const convertProcess = await spawn('mogrify', [
            '-crop', '4000x666+0+0',
            '-resize', '40%',
            '-path', '../output-cropped',
            '*.png'
        ], {cwd: '/tmp/output-original/'});

        console.log('Image crop complete!');

        convertProcess.childProcess.kill();

        const upload = async outputType => {
            // Read files
            const fileNames = await fs.readdir(`/tmp/output-${outputType}`);

            // Upload files
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

        if (pdfText.includes('jazzbandcharts')) {
            const excludePattern = /(vox\.|[bat]\. sx|tpt|tbn|pno|d\.s\.)/ig;

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

            const snapshot = await admin.firestore().collection('instruments').get();

            const instruments = snapshot.docs.map(doc => ({...doc.data(), ref: doc.ref}));

            const parts = [{
                page: 2,
                instruments: [admin.firestore().doc('instruments/YFNsZF5GxxpkfBqtbouy')]
            }];

            const nameCount = {};

            for (let i = 3; i < _pages.length; i++) {
                const page = _pages[i];

                const mExclude = excludePattern.test(page);

                const detectedInstrNames = [];

                if (!mExclude) {
                    for (let pattern of patterns) {
                        const isMatch = pattern.expr.test(page);

                        if (isMatch &&
                            /*Simulate negative lookbehind*/
                            !pattern.expr.exec(page)[1]) {
                            detectedInstrNames.push(pattern.name);
                        }
                    }
                }

                if (detectedInstrNames.length > 0) {
                    if (detectedInstrNames.length === 1) {
                        const [name] = detectedInstrNames;

                        if (['Alto Sax', 'Tenor Sax', 'Trumpet', 'Trombone'].indexOf(name) > -1) {
                            if (!nameCount[name]) {
                                nameCount[name] = 0;
                            }

                            const instrRef = instruments.find(instr =>
                                instr['name'] === `${name} ${nameCount[name] + 1}`).ref;

                            parts.push({
                                page: i,
                                instruments: [instrRef]
                            });

                            nameCount[name] += 1;
                        } else {
                            const instrRef = instruments.find(instr => instr['name'] === name).ref;

                            parts.push({
                                page: i,
                                instruments: [instrRef]
                            });
                        }
                    } else {
                        const instrRefs = detectedInstrNames.map(name =>
                            instruments.find(instr => instr['name'] === name).ref
                        );

                        parts.push({
                            page: i,
                            instruments: instrRefs
                        });
                    }
                }
            }

            data['parts'] = parts;
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
    const {bandId, pdfId} = req.query;

    const bucket = storage.bucket('scores-butler.appspot.com');

    await bucket.file(`bands/${bandId}/pdfs/${pdfId}/combinedImage.png`).download({destination: '/tmp/image.png'});

    const client = new vision.ImageAnnotatorClient();

    const response = await client.textDetection('/tmp/image.png');
    const detections = response[0];

    await res.json(detections);
});

exports.generatePDF = functions.https.onRequest(async (req, res) => {
    const bucket = storage.bucket('scores-butler.appspot.com');

    const doc = new PDFDocument();

    const image = '';

    const file = bucket.file('test/test.pdf');
    await file.setMetadata({contentType: 'application/pdf'});

    const writeStream = file.createWriteStream();

    doc.pipe(writeStream);
    doc.image(image, 0, 0);
    doc.end();

    writeStream.on('finish', async () => {
        res.status(200).send();
    });
});

exports.uploadFromDropbox = functions.https.onRequest((req, res) => {
    return cors({origin: true})(req, res, async () => {
        const {bandId, folderPath, accessToken} = req.query;
        const dropbox = new Dropbox({accessToken: accessToken});
        const response = await dropbox.filesDownloadZip({path: folderPath}) as any;
        const bucket = storage.bucket('scores-butler.appspot.com');
        await bucket.file(`${bandId}/${Math.random().toString().slice(2)}.zip`).save(response.fileBinary);
        res.status(200).send();
    });
});

exports.updatePartCount = functions.firestore
    .document('bands/{bandId}/scores/{scoreId}/parts/{partId}').onWrite(async event => {
        const partRef = event.data.ref.parent.parent;
        const partCount = (await partRef.collection('parts').get()).size;
        await partRef.update({partCount: partCount});
    });

exports.createThumbnail = functions.firestore
    .document('bands/{bandId}/scores/{scoreId}').onCreate(async event => {
        const data = event.data.data();
        if (data.composer) {
            const response = await request({
                uri: `https://www.googleapis.com/customsearch/v1?key=AIzaSyCufxroiY-CPDEHoprY0ESDpWnFcHICioQ&cx=015179294797728688054:y0lepqsymlg&q=${data.composer}&searchType=image`,
                json: true
            });
            event.data.ref.update({thumbnailURL: response.items[0].link});
        }
    });



