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

import Home from './views/Home';
import Band from './views/Band';
import Arrangement from './views/Arrangement';
import Setlist from './views/Setlist';

import defaultReducer from './reducers';

import registerServiceWorker from './registerServiceWorker';


// Material-UI

const theme = createMuiTheme({
    palette: {
        primary: purple,
        secondary: green
    }
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

