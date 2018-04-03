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
            '-raw',
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

        const patternShort = /(vox\.|[bat]\. sx|tpt|tbn|pno|d\.s\.)/ig;
        const patternFull = /(vocal|(alto|tenor) sax|trumpet|trombone|guitar|piano|bass|drum set)/ig;

        if (pdfText.includes('jazzbandcharts')) {
            const _pages = pdfText.split('\f');
            const instruments = <[any]>[{pageRange: [2], name: 'score'}];

            for (let i = 3; i < _pages.length; i++) {
                const page = _pages[i];

                const mShort = page.match(patternShort);
                const mFull = page.match(patternFull);

                if (!mShort && mFull && mFull.length < 3) {
                    instruments[instruments.length - 1].pageRange.push(i);

                    const [instr1, instr2] = mFull;

                    if (mFull.length === 2) {
                        instruments.push({pageRange: [i], name: [instr1, instr2]});
                    } else {
                        const instrCount = instruments.filter(instr =>
                            !Array.isArray(instr.name) && instr.name.includes(instr1)
                        ).length;

                        instruments.push({pageRange: [i], name: instr1});

                        if (instrCount > 0) {
                            instruments[instruments.length - 2].name = `${instr1} ${instrCount}`;
                            instruments[instruments.length - 1].name = `${instr1} ${instrCount + 1}`;
                        }
                    }
                }
            }

            instruments[instruments.length - 1].pageRange.push(pages.length);

            data['instruments'] = instruments;
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



