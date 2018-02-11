import React from 'react';
import {render} from 'react-dom';

import {Provider} from 'react-redux';
import {applyMiddleware, createStore, combineReducers} from 'redux';

import createHistory from 'history/createBrowserHistory'
import {Route} from 'react-router'
import {ConnectedRouter, routerReducer, routerMiddleware} from 'react-router-redux'
import thunk from 'redux-thunk';

import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';
import purple from 'material-ui/colors/purple';
import green from 'material-ui/colors/green';

import firebase from 'firebase';
import 'firebase/firestore'

import Home from './components/Home';
import Band from './components/Band';
import Arrangement from './components/Arrangement';
import Setlist from './components/Setlist';

import defaultReducer from './reducers';

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

const history = createHistory();

const initialState = {

};

const store = createStore(
    combineReducers({default: defaultReducer, router: routerReducer}),
    initialState,
    applyMiddleware(thunk, routerMiddleware(history))
);

render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <MuiThemeProvider theme={theme}>
                <Route exact path="/" component={Home}/>
                <Route path="/band" component={Band}/>
                <Route path="/arrangement" component={Arrangement}/>
                <Route path="/setlist" component={Setlist}/>
            </MuiThemeProvider>
        </ConnectedRouter>
    </Provider>,
    document.querySelector('#root')
);

registerServiceWorker();

