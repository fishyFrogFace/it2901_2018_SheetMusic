// const path = require('path');
// const {Storage} = require('@google-cloud/storage');
// const {spawn} = require('child-process-promise');
// const fs = require('fs-extra');
// const admin = require('firebase-admin');

// const serviceAccount = require('./service-account-key');

// const storage = Storage({keyFilename: 'service-account-key.json'});


// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: 'https://scoresbutler-9ff30.firebaseio.com',
//     storageBucket: 'scoresbutler-9ff30.appspot.com'
// });


// admin.firestore().collection('__pdfs').onSnapshot(snap => {
//    snap.docChanges().forEach(async change => {
//        if (change.type === "added") {

//            const {filePath} = change.doc.data();
//            console.log('Filepath:', filePath);

//            let [bandId, fileNameExt] = filePath.split('/');

//            // File name without extension
//            const fileName = path.basename(fileNameExt, '.pdf');

//            const inputBucket = storage.bucket('scoresbutler-9ff30.appspot.com');
//            const pdfBucket = storage.bucket('scoresbutler-9ff30.appspot.com');

//            const rand = Math.random().toString().substring(2, 10);

//            const _root = `./__tmp/${rand}`;

//            await fs.ensureDir(_root);

//            const destFilename = `${_root}/score.pdf`;

//            // Download to local directory
//            console.log(`Downloading to local directory ${destFilename}...`);
//            await inputBucket.file(filePath).download({destination: destFilename});

//            // Delete PDF file
//            console.log('Deleting file...');
//            await inputBucket.file(filePath).delete();

//            // Create output directories
//            console.log('Creating directories...');
//            await fs.ensureDir(`${_root}/output-original`);
//            await fs.ensureDir(`${_root}/output-cropped`);
//            await fs.ensureDir(`${_root}/output-cropped-compressed`);

//            // Error med Spawn EACCSES
//            console.log('Getting PDF info...');
//            const pdfInfo = await new Promise(async resolve => {
//                const promise = spawn('./xpdf/pdfinfo', [
//                    `${_root}/score.pdf`,
//                ]);
//                promise.childProcess.stdout.on('data', _data => {
//                    promise.childProcess.kill();
//                    resolve(_data.toString());
//                });
//                await promise;
//            });

//            const match = /Pages:[ ]+(\d+)/.exec(pdfInfo);

//            console.log('Creating document...');

//            // Crasher her
//            const pdfRef = await admin.firestore().collection(`bands/${bandId}/pdfs`).add({
//                name: fileName,
//                uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
//                pageCount: parseInt(match[1]),
//                processing: true
//            });

//            console.log('Generating images...');

//            // Crasher her nå
//             const gsProcess = await spawn('C:\\Program Files\\gs\\gs9.26\\bin\\gswin64c.exe', [
//                 '-dBATCH',
//                 '-dNOPAUSE',
//                 '-sDEVICE=pngmonod',
//                 `-sOutputFile=${_root}/output-original/score-%03d.png`,
//                 '-r300',
//                 `${_root}/score.pdf`
//                 ]);

//            gsProcess.childProcess.kill();

//            console.log('Cropping images...');

//            const convertProcess = await spawn('C:\\Program Files\\ImageMagick-7.0.8-Q16\\mogrify.exe', [
//                '-crop', '4000x666+0+0',
//                '-resize', '40%',
//                '-path', '../output-cropped',
//                '*.png'
//            ], {cwd: `${_root}/output-original`});

//            convertProcess.childProcess.kill();

//            const upload = async outputType => {
//                // Read files
//                const fileNames = await fs.readdir(`${_root}/output-${outputType}`);

//                // Upload files
//                const uploadResponses = await Promise.all(
//                    fileNames.map((name, index) =>
//                        pdfBucket.upload(`${_root}/output-${outputType}/${name}`, {
//                            destination: `${bandId}/${pdfRef.id}/${outputType}/${index}.png`,
//                            metadata: {
//                                contentType: 'image/png'
//                            }
//                        })
//                    ));

//                // Generate urls
//                return await Promise.all(
//                    uploadResponses.map(([file]) =>
//                        file.getSignedUrl({
//                            action: 'read',
//                            expires: '03-09-2491'
//                        })
//                    )
//                );
//            };

//            console.log('Uploading images...');

//            const croppedPageUrls = (await upload('cropped')).map(([url]) => url);
//            const originalPageUrls = (await upload('original')).map(([url]) => url);

//            // Add page documents
//            const pages = [];
//            for (let i = 0; i < croppedPageUrls.length; i++) {
//                pages.push({
//                    croppedURL: croppedPageUrls[i],
//                    originalURL: originalPageUrls[i]
//                })
//            }

//            // Analyze PDF

//            console.log('Analyzing...');

//            const process2 = await spawn('xpdf/pdftotext', [
//                `${_root}/score.pdf`,
//            ]);

//            process2.childProcess.kill();

//            const data = {
//                processing: admin.firestore.FieldValue.delete(),
//                thumbnailURL: croppedPageUrls[0],
//                pages: pages,
//            };

//            const pdfText = await fs.readFile(`${_root}/score.txt`, 'latin1');

//            if (pdfText.includes('jazzbandcharts')) {
//                // const excludePattern = /(vox\.|[bat]\. sx|tpt|tbn|pno|d\.s\.)/ig;

//                const patterns = [{
//                    name: 'Score',
//                    expr: /(: )?score/i
//                }, {
//                    name: 'Vocal',
//                    expr: /(\w )?vocal/i
//                }, {
//                    name: 'Alto Sax',
//                    expr: /(\w )?alto sax\. \d/i
//                }, {
//                    name: 'Tenor Sax',
//                    expr: /(\w )?tenor sax\. \d/i
//                }, {
//                    name: 'Baritone Sax',
//                    expr: /(\w )?baritone sax\./i
//                }, {
//                    name: 'Trumpet',
//                    expr: /(\w )?trumpet .{0,6}\d/i
//                }, {
//                    name: 'Trombone',
//                    expr: /(\w )?trombone \d/i
//                }, {
//                    name: 'Guitar',
//                    expr: /(\w )?guitar/i
//                }, {
//                    name: 'Piano',
//                    expr: /(\w )?piano/i
//                }, {
//                    name: 'Bass',
//                    expr: /(\w )?bass/i
//                }, {
//                    name: 'Drum Set',
//                    expr: /(\w )?drum set/i
//                }];

//                const _pages = pdfText.split('\f');

//                const snapshot = await admin.firestore().collection('instruments').get();

//                const instruments = snapshot.docs.map(doc => ({...doc.data(), ref: doc.ref}));

//                const parts = [{
//                    page: 2,
//                    instruments: [admin.firestore().doc('instruments/YFNsZF5GxxpkfBqtbouy')]
//                }];

//                const nameCount = {};

//                for (let i = 3; i < _pages.length; i++) {
//                    const page = _pages[i];

//                    // const mExclude = excludePattern.test(page);

//                    const detectedInstrNames = [];

//                    // if (!mExclude) {
//                    for (let pattern of patterns) {
//                        const isMatch = pattern.expr.test(page);

//                        if (isMatch &&
//                            /*Simulate negative lookbehind*/
//                            !pattern.expr.exec(page)[1]) {
//                            detectedInstrNames.push(pattern.name);
//                        }
//                    }
//                    // }

//                    if (detectedInstrNames.length > 0) {
//                        if (detectedInstrNames.length === 1) {
//                            const [name] = detectedInstrNames;

//                            if (['Alto Sax', 'Tenor Sax', 'Trumpet', 'Trombone'].indexOf(name) > -1) {
//                                if (!nameCount[name]) {
//                                    nameCount[name] = 0;
//                                }

//                                const instrRef = instruments.find(instr =>
//                                    instr['name'] === `${name} ${nameCount[name] + 1}`).ref;

//                                parts.push({
//                                    page: i,
//                                    instruments: [instrRef]
//                                });

//                                nameCount[name] += 1;
//                            } else {
//                                const instrRef = instruments.find(instr => instr['name'] === name).ref;

//                                parts.push({
//                                    page: i,
//                                    instruments: [instrRef]
//                                });
//                            }
//                        } else {
//                            const instrRefs = detectedInstrNames.map(name =>
//                                instruments.find(instr => instr['name'] === name).ref
//                            );

//                            parts.push({
//                                page: i,
//                                instruments: instrRefs
//                            });
//                        }
//                    }
//                }

//                data['parts'] = parts;
//            }

//            await pdfRef.update(data);

//            // Clean up
//            await fs.remove(_root);

//            console.log('Done...');
//        }
//    });
// });


//             const inputBucket = storage.bucket('scoresbutler-9ff30.appspot.com');
//             const pdfBucket = storage.bucket('scoresbutler-9ff30.appspot.com');


// // const path = require('path');
// // const Storage = require('@google-cloud/storage');
// // const {spawn} = require('child-process-promise');
// // const fs = require('fs-extra');
// // const admin = require('firebase-admin');

// // const serviceAccount = require('./service-account-key');

// // const storage = Storage({keyFilename: 'service-account-key.json'});

// // admin.initializeApp({
// //     credential: admin.credential.cert(serviceAccount),
// //     databaseURL: 'https://scoresbutler-9ff30.firebaseio.com',
// //     storageBucket: 'scoresbutler-9ff30.appspot.com'
// // });

// // admin.firestore().collection('__pdfs').onSnapshot(snap => {
// //     console.log("Somechane");
// //     snap.docChanges.forEach(async change => {
// //         if (change.type === "added") {
// //             const {filePath} = change.doc.data();

// //             let [bandId, fileNameExt] = filePath.split('/');

// //             // File name without extension
// //             const fileName = path.basename(fileNameExt, '.pdf');

// //             const inputBucket = storage.bucket('scoresbutler-9ff30.appspot.com');
// //             const pdfBucket = storage.bucket('scores-butler-pdfs');

// //             const rand = Math.random().toString().substring(2, 10);

// //             const _root = `./__tmp/${rand}`;

// //             await fs.ensureDir(_root);

// //             // Download to local directory
// //             await inputBucket.file(filePath).download({destination: `${_root}/score.pdf`});

// //             // Delete PDF file
// //             await inputBucket.file(filePath).delete();

// //         console.log("Depeted");

// //             console.log('Creating directories...');

//             const gsProcess = await spawn('C:\\Program Files\\gs\\gs9.22\\bin\\gswin64c.exe', [
//                 '-dBATCH',
//                 '-dNOPAUSE',
//                 '-sDEVICE=pngmonod',
//                 `-sOutputFile=${_root}/output-original/score-%03d.png`,
//                 '-r300',
//                 `${_root}/score.pdf`
//             ]);

//             gsProcess.childProcess.kill();

//             console.log('Cropping images...');

//             const convertProcess = await spawn('C:\\Program Files\\ImageMagick-7.0.7-Q16\\mogrify.exe', [
//                 '-crop', '4000x666+0+0',
//                 '-resize', '40%',
//                 '-path', '../output-cropped',
//                 '*.png'
//             ], {cwd: `${_root}/output-original`});

//             convertProcess.childProcess.kill();

//             const upload = async outputType => {
//                 // Read files
//                 const fileNames = await fs.readdir(`${_root}/output-${outputType}`);

//                 // Upload files
//                 const uploadResponses = await Promise.all(
//                     fileNames.map((name, index) =>
//                         pdfBucket.upload(`${_root}/output-${outputType}/${name}`, {
//                             destination: `${bandId}/${pdfRef.id}/${outputType}/${index}.png`,
//                             metadata: {
//                                 contentType: 'image/png'
//                             }
//                         })
//                     ));

//                 // Generate urls
//                 return await Promise.all(
//                     uploadResponses.map(([file]) =>
//                         file.getSignedUrl({
//                             action: 'read',
//                             expires: '03-09-2491'
//                         })
//                     )
//                 );
//             };

//             console.log('Uploading images...');

//             const croppedPageUrls = (await upload('cropped')).map(([url]) => url);
//             const originalPageUrls = (await upload('original')).map(([url]) => url);

//             // Add page documents
//             const pages = [];
//             for (let i = 0; i < croppedPageUrls.length; i++) {
//                 pages.push({
//                     croppedURL: croppedPageUrls[i],
//                     originalURL: originalPageUrls[i]
//                 })
//             }

//             // Analyze PDF
//             console.log('Analyzing...');

//             const process2 = await spawn('xpdf/pdftotext', [
//                 `${_root}/score.pdf`,
//             ]);

//             process2.childProcess.kill();

//             const data = {
//                 processing: admin.firestore.FieldValue.delete(),
//                 thumbnailURL: croppedPageUrls[0],
//                 pages: pages,
//             };

//             const pdfText = await fs.readFile(`${_root}/score.txt`, 'latin1');

//             if (pdfText.includes('jazzbandcharts')) {
//                 // const excludePattern = /(vox\.|[bat]\. sx|tpt|tbn|pno|d\.s\.)/ig;

//                 const patterns = [{
//                     name: 'Score',
//                     expr: /(: )?score/i
//                 }, {
//                     name: 'Vocal',
//                     expr: /(\w )?vocal/i
//                 }, {
//                     name: 'Alto Sax',
//                     expr: /(\w )?alto sax\. \d/i
//                 }, {
//                     name: 'Tenor Sax',
//                     expr: /(\w )?tenor sax\. \d/i
//                 }, {
//                     name: 'Baritone Sax',
//                     expr: /(\w )?baritone sax\./i
//                 }, {
//                     name: 'Trumpet',
//                     expr: /(\w )?trumpet .{0,6}\d/i
//                 }, {
//                     name: 'Trombone',
//                     expr: /(\w )?trombone \d/i
//                 }, {
//                     name: 'Guitar',
//                     expr: /(\w )?guitar/i
//                 }, {
//                     name: 'Piano',
//                     expr: /(\w )?piano/i
//                 }, {
//                     name: 'Bass',
//                     expr: /(\w )?bass/i
//                 }, {
//                     name: 'Drum Set',
//                     expr: /(\w )?drum set/i
//                 }];

//                 const _pages = pdfText.split('\f');

//                 const snapshot = await admin.firestore().collection('instruments').get();

//                 const instruments = snapshot.docs.map(doc => ({...doc.data(), ref: doc.ref}));

//                 const parts = [{
//                     page: 2,
//                     instruments: [admin.firestore().doc('instruments/YFNsZF5GxxpkfBqtbouy')]
//                 }];

//                 const nameCount = {};

//                 for (let i = 3; i < _pages.length; i++) {
//                     const page = _pages[i];

//                     // const mExclude = excludePattern.test(page);

//                     const detectedInstrNames = [];

//                     // if (!mExclude) {
//                     for (let pattern of patterns) {
//                         const isMatch = pattern.expr.test(page);

//                         if (isMatch &&
//                             /*Simulate negative lookbehind*/
//                             !pattern.expr.exec(page)[1]) {
//                             detectedInstrNames.push(pattern.name);
//                         }
//                     }
//                     // }

//                     if (detectedInstrNames.length > 0) {
//                         if (detectedInstrNames.length === 1) {
//                             const [name] = detectedInstrNames;

//                             if (['Alto Sax', 'Tenor Sax', 'Trumpet', 'Trombone'].indexOf(name) > -1) {
//                                 if (!nameCount[name]) {
//                                     nameCount[name] = 0;
//                                 }

//                                 const instrRef = instruments.find(instr =>
//                                     instr['name'] === `${name} ${nameCount[name] + 1}`).ref;

//                                 parts.push({
//                                     page: i,
//                                     instruments: [instrRef]
//                                 });

//                                 nameCount[name] += 1;
//                             } else {
//                                 const instrRef = instruments.find(instr => instr['name'] === name).ref;

//                                 parts.push({
//                                     page: i,
//                                     instruments: [instrRef]
//                                 });
//                             }
//                         } else {
//                             const instrRefs = detectedInstrNames.map(name =>
//                                 instruments.find(instr => instr['name'] === name).ref
//                             );

//                             parts.push({
//                                 page: i,
//                                 instruments: instrRefs
//                             });
//                         }
//                     }
//                 }

//                 data['parts'] = parts;
//             }

//             await pdfRef.update(data);

//             // Clean up
//             await fs.remove(_root);

//             console.log('Done...');
//         }
//     });
// });
