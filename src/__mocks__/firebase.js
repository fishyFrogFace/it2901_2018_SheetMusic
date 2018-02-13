const firebase = jest.genMockFromModule('firebase');


const band = {};

function __setMockBand(mockBand) {
    for (let k of Object.keys(mockBand)) {
        band[k] = mockBand[k];
    }
}

function firestore() {
    return {
        collection: path => ({
            get: () => Promise.resolve({docs: []}),
            add: data => Promise.resolve({id: 'id'}),
            where: (a, operand, b) => ({
                get: () => new Promise(resolve => {
                    let docs = [];

                    if (a === 'code' && operand === '==' && b === band.code) {
                        docs.push({});
                    }

                    resolve({docs: docs});
                })
            })
        }),
        doc: path => ({
            get: () => Promise.resolve({id: 'id', data: () => ({})})
        })
    };
}

firebase.__setMockBand = __setMockBand;
firebase.firestore = firestore;

export default firebase;