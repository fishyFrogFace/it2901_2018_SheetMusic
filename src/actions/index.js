import firebase from 'firebase';

export const signIn = () => async dispatch => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        let result = await firebase.auth().signInWithPopup(provider);
        dispatch({type: 'SIGN_IN_SUCCESS', user: result.user});
    } catch (err) {
        dispatch({type: 'SIGN_IN_FAILURE', error: err});
    }
};