import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';
import firebase from "firebase";

const styles = {
    root: {
    }
};

class SignIn extends Component {
    async _onSignIn() {
        const provider = new firebase.auth.GoogleAuthProvider();

        try {
            await firebase.auth().signInWithPopup(provider);
        } catch (err) {
            console.log(err);
        }
    }

    render() {
        const {classes} = this.props;

        return (
            <div>
                <div onClick={() => this._onSignIn('google')}>Sign in with google</div>
            </div>
        );
    }
}


export default withStyles(styles)(SignIn);