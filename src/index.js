import React from 'react';
import {render} from 'react-dom';

import {Provider, connect} from 'react-redux';
import {applyMiddleware, createStore, combineReducers} from 'redux';

import createHistory from 'history/createBrowserHistory'
import {Route, Switch} from 'react-router'
import {ConnectedRouter, routerReducer, routerMiddleware, push} from 'react-router-redux'
import thunk from 'redux-thunk';

import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';
import purple from 'material-ui/colors/purple';
import green from 'material-ui/colors/green';

import firebase from 'firebase';
import 'firebase/firestore';

import Home from './containers/Home';
import Band from './containers/Band';
import Arrangement from './containers/Arrangement';
import Setlist from './containers/Setlist';
import SignIn from "./containers/SignIn";

import defaultReducer from './reducers';

import registerServiceWorker from './registerServiceWorker';
import {Redirect} from "react-router-dom";

firebase.initializeApp({
    apiKey: "AIzaSyC1C3bHfQnCea25zRBCabhkahtYLhTTHyg",
    authDomain: "scores-butler.firebaseapp.com",
    databaseURL: "https://scores-butler.firebaseio.com",
    projectId: "scores-butler",
    storageBucket: "scores-butler.appspot.com",
    messagingSenderId: "124262758995"
});


// Material-UI

const theme = createMuiTheme({
    palette: {
        primary: purple,
        secondary: green
    }
});

const history = createHistory();

const store = createStore(
    combineReducers({default: defaultReducer, router: routerReducer}),
    {},
    applyMiddleware(thunk, routerMiddleware(history))
);

class CustomRouteContainer extends React.Component {
    render() {
        const {authStateLoaded, user, component: Component, location, ...props} = this.props;

        return (
            <Route
                {...props}
                render={props => {
                    if (!authStateLoaded) {
                        return <div>Loading</div>;
                    }

                    if (user && location.pathname === '/signin') {
                        return <Redirect to={{pathname: '/', state: {from: props.location}}}/>
                    }

                    if (!user && location.pathname !== '/signin') {
                        return <Redirect to={{pathname: '/signin', state: {from: props.location}}}/>
                    }

                    return <Component {...props} />
                }}
            />
        )
    }
}

const CustomRoute = connect(state => ({
    authStateLoaded: state.default.authStateLoaded,
    user: state.default.user
}))(CustomRouteContainer);

render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <MuiThemeProvider theme={theme}>
                <Switch>
                    <CustomRoute exact path="/" component={Home}/>
                    <CustomRoute path='/signin' component={SignIn}/>
                    <CustomRoute path="/band" component={Band}/>
                    <CustomRoute path="/arrangement" component={Arrangement}/>
                    <CustomRoute path="/setlist" component={Setlist}/>
                </Switch>
            </MuiThemeProvider>
        </ConnectedRouter>
    </Provider>,
    document.querySelector('#root')
);

const getAuthState = () => dispatch => {
    let unsubscribe = firebase.auth().onAuthStateChanged(user => {
        dispatch({type: 'AUTH_STATE_LOAD_SUCCESS', user: user});
        unsubscribe();
    });
};

store.dispatch(getAuthState());

registerServiceWorker();

