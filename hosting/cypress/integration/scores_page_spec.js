import firebase from "firebase";
import * as admin from "firebase-admin";

describe('The Home Page', function() {
    it('successfully loads', function () {
        cy.visit('/')
    });

    let username = 'oystein.holland@gmail.com';
    let password = '0aEc262ur2Qj';
    admin.initializeApp();

    it('logs in', function () {
        let promise = firebase.auth().signInWithEmailAndPassword(username, password);
    });

});
