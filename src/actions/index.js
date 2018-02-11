import firebase from 'firebase';

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

            let userSnapshot = await firebase.firestore().doc(`users/${result.user.uid}`).get();

            if (!userSnapshot.exists) {
                await userSnapshot.ref.set({name: result.user.displayName});
                dispatch({type: 'USER_CREATE_SUCCESS', user: result.user});
            }
        } catch (err) {
            dispatch({type: 'SIGN_IN_FAILURE', error: err});
        }
    }
};

export const getBands = () => async (dispatch, getState) => {
    let userId = getState().default.user.uid;

    let snapshot = await firebase.firestore().collection(`users/${userId}/bands`).get();
    let bands = await Promise.all(snapshot.docs.map(async doc => {
        const bandDoc = await doc.data().ref.get();
        return {id: bandDoc.id, ...bandDoc.data()};
    }));

    dispatch({type: 'BANDS_FETCH_RESPONSE', bands: bands})
};

export const getArrangements = () => async (dispatch, getState) => {
    let bandId = getState().router.location.pathname.split('/')[2];

    let snapshot = await firebase.firestore().collection(`bands/${bandId}/arrangements`).get();
    let arrangements = await Promise.all(snapshot.docs.map(async doc => {
        const arrDoc = await doc.data().ref.get();
        return {id: arrDoc.id, ...arrDoc.data()};
    }));

    dispatch({type: 'ARRANGEMENTS_FETCH_RESPONSE', arrangements: arrangements})
};

export const getArrangementDetail = () => async (dispatch, getState) => {
    let arrId = getState().router.location.pathname.split('/')[2];

    let doc = await firebase.firestore().doc(`arrangements/${arrId}`).get();

    dispatch({type: 'ARRANGEMENT_FETCH_RESPONSE', arrangement: {id: doc.id, ...doc.data()}})
};


