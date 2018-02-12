import firebase from 'firebase';
import 'firebase/firestore';
firebase.initializeApp({
    apiKey: "AIzaSyC1C3bHfQnCea25zRBCabhkahtYLhTTHyg",
    authDomain: "scores-butler.firebaseapp.com",
    databaseURL: "https://scores-butler.firebaseio.com",
    projectId: "scores-butler",
    storageBucket: "scores-butler.appspot.com",
    messagingSenderId: "124262758995"
});

const firestore = firebase.firestore();

export const signIn = () => async dispatch => {
    let user = await new Promise((resolve, reject) => {
        let unsubscribe = firebase.auth().onAuthStateChanged(user => {
            unsubscribe();
            resolve(user);
        });
    });

    if (user) {
        dispatch({type: 'SIGN_IN_SUCCESS', user: user});
    } else {
        const provider = new firebase.auth.GoogleAuthProvider();

        try {
            let result = await firebase.auth().signInWithPopup(provider);

            dispatch({type: 'SIGN_IN_SUCCESS', user: result.user});

            let userSnapshot = await firestore.doc(`users/${result.user.uid}`).get();

            if (!userSnapshot.exists) {
                await userSnapshot.ref.set({name: result.user.displayName});
                dispatch({type: 'USER_CREATE_SUCCESS', user: result.user});
            }
        } catch (err) {
            dispatch({type: 'SIGN_IN_FAILURE', error: err});
        }
    }
};

export const getBands = (userId) => async dispatch => {
    let snapshot = await firestore.collection(`users/${userId}/bands`).get();
    let bands = await Promise.all(snapshot.docs.map(async doc => {
        const bandDoc = await doc.data().ref.get();
        return {id: bandDoc.id, ...bandDoc.data()};
    }));

    dispatch({type: 'BANDS_FETCH_RESPONSE', bands: bands})
};

export const getBandDetail = bandId => async dispatch => {
    let doc = await firestore.doc(`bands/${bandId}`).get();

    let band = doc.data();

    let snapshot = await firestore.collection(`bands/${bandId}/arrangements`).get();

    band.arrangements = await Promise.all(snapshot.docs.map(async doc => {
        const arrDoc = await doc.data().ref.get();
        return {id: arrDoc.id, ...arrDoc.data()};
    }));

    dispatch({type: 'BAND_FETCH_RESPONSE', band: band})
};

export const addBand = name => async (dispatch, getState) => {
    let userId = getState().default.user.uid;

    try {
        const band = {
            name: name,
            creator: firestore.doc(`users/${userId}`)
        };

        let ref = await firestore.collection('bands').add(band);
        await firestore.collection(`users/${userId}/bands`).add({ref: firestore.doc(`bands/${ref.id}`)});

        dispatch({type: 'BAND_ADD_SUCCESS', band: {id: ref.id, ...band}});
    } catch (err) {
        dispatch({type: 'BAND_ADD_FAILURE'});
    }
};

export const getArrangementDetail = arrId => async dispatch => {
    let doc = await firestore.doc(`arrangements/${arrId}`).get();
    dispatch({type: 'ARRANGEMENT_FETCH_RESPONSE', arrangement: {id: doc.id, ...doc.data()}})
};

export const addArrangement = (title, composer) => async (dispatch, getState) => {
    let userId = getState().default.user.uid;
    let bandId = getState().router.location.pathname.split('/')[2];

    try {
        const arrangement = {
            title: title,
            composer: composer,
            creator: firestore.doc(`users/${userId}`)
        };

        let ref = await firestore.collection('arrangements').add(arrangement);
        await firestore.collection(`bands/${bandId}/arrangements`).add({ref: firestore.doc(`arrangements/${ref.id}`)});

        dispatch({type: 'ARRANGEMENT_ADD_SUCCESS', arrangement: {id: ref.id, ...arrangement}});
    } catch (err) {
        dispatch({type: 'ARRANGEMENT_ADD_FAILURE'});
    }
};


