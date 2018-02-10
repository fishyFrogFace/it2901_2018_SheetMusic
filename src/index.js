import React from 'react';
import {render} from 'react-dom';

import {Provider} from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import thunk from 'redux-thunk';

import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';
import purple from 'material-ui/colors/purple';
import green from 'material-ui/colors/green';

import firebase from 'firebase';
import 'firebase/firestore'

import App from './components/App';
import reducer from './reducer';

import registerServiceWorker from './registerServiceWorker';


// Material-UI

const theme = createMuiTheme({
    palette: {
        primary: purple,
        secondary: green
    }
});

// Firebase

firebase.initializeApp({
    apiKey: "AIzaSyC1C3bHfQnCea25zRBCabhkahtYLhTTHyg",
    authDomain: "scores-butler.firebaseapp.com",
    databaseURL: "https://scores-butler.firebaseio.com",
    projectId: "scores-butler",
    storageBucket: "scores-butler.appspot.com",
    messagingSenderId: "124262758995"
});

// Redux

const initialState = {};
const store = createStore(reducer, initialState, applyMiddleware(thunk));

render(
    <Provider store={store}>
        <MuiThemeProvider theme={theme}>
            <App/>
        </MuiThemeProvider>
    </Provider>,
    document.querySelector('#root')
);


registerServiceWorker();
