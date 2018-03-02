const functions = require('firebase-functions');
const Canvas = require('canvas-prebuilt');
const PDFJS = require('pdfjs-dist');
const Storage = require('@google-cloud/storage');

PDFJS.disableFontFace = true;

const storage = new Storage();

function NodeCanvasFactory() {
}

NodeCanvasFactory.prototype = {
    create: function NodeCanvasFactory_create(width, height) {
        let canvas = new Canvas(width, height);
        let context = canvas.getContext('2d');
        return {
            canvas: canvas,
            context: context,
        };
    },

    reset: function NodeCanvasFactory_reset(canvasAndContext, width, height) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
    },

    destroy: function NodeCanvasFactory_destroy(canvasAndContext) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
    }
};


exports.test = functions.https.onRequest((req, res) => {
    const bucket = storage.bucket('scores-butler.appspot.com');

    return bucket.file('pdf/score.pdf').download()
        .then(response => {
            const data = new Uint8Array(response[0]);
            return PDFJS.getDocument(data);
        })
        .then(pdfDocument => pdfDocument.getPage(1))
        .then(page => {
            let viewport = page.getViewport(2.0);

            let canvasFactory = new NodeCanvasFactory();

            let canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

            let renderContext = {
                canvasContext: canvasAndContext.context,
                viewport: viewport,
                canvasFactory: canvasFactory
            };

            return page.render(renderContext).then(() => canvasAndContext);
        }).then(canvasAndContext => {
            console.log(canvasAndContext);

            let image = canvasAndContext.canvas.toBuffer();

            return new Promise((resolve, reject) => {
                bucket.file('image/score.png').save(image, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }).catch(reason => {
            console.log(reason);
        });

});





