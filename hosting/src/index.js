import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';

import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';
import purple from 'material-ui/colors/purple';
import green from 'material-ui/colors/green';

import 'firebase/firestore';
import 'firebase/auth';

class App extends React.Component {
    state = {
        user: {}
    };

    constructor() {
        super();

        firebase.initializeApp({
            apiKey: "AIzaSyC1C3bHfQnCea25zRBCabhkahtYLhTTHyg",
            authDomain: "scores-butler.firebaseapp.com",
            databaseURL: "https://scores-butler.firebaseio.com",
            projectId: "scores-butler",
            storageBucket: "scores-butler.appspot.com",
            messagingSenderId: "124262758995"
        });

        firebase.auth().onAuthStateChanged(user => this._onUserStateChanged(user));
        window.addEventListener('hashchange', () => this._onHashChange());
    }

    async _onUserStateChanged(user) {
        if (user) {
            firebase.firestore().doc(`users/${user.uid}`).onSnapshot(async userSnapshot => {
                if (!userSnapshot.exists) {
                    await userSnapshot.ref.set({email: user.email, displayName: user.displayName, photoURL: user.photoURL});

                    let bandRef = await firebase.firestore().collection('bands').add({
                        name: `${user.displayName.split(' ')[0]}'s band`
                    });

                    await userSnapshot.ref.collection('bands').add({
                        ref: bandRef
                    });

                    await userSnapshot.ref.update({defaultBand: bandRef});
                }

                this.setState({user: {...this.state.user, ...userSnapshot.data()}});
            });


            firebase.firestore().collection(`users/${user.uid}/bands`).onSnapshot(async snapshot => {
                this.setState({user: {...this.state.user, bands: snapshot.docs}});
            })
        }

        let hash = (() => {
            if (user && window.location.hash === '#/signin') {
                return '#/home';
            } else if (!user && window.location.hash !== '#/signin') {
                return '#/signin';
            } else {
                return window.location.hash;
            }
        })();

        if (hash === window.location.hash) {
            window.dispatchEvent(new HashChangeEvent("hashchange"));
        } else {
            window.location.hash = hash;
        }
    }


    async _onHashChange() {
        const hash = window.location.hash || '#/home';

        let [page, detail] = hash.split('/').slice(1);

        const page2component = {
            home: 'Home',
            score: 'Score',
            setlist: 'Setlist',
            signin: 'SignIn'
        };

        try {
            const component = (await import(`./containers/${page2component[page]}.js`)).default;

            this.setState({page: page, detail: detail, component: component});

        } catch (err) {
            console.log(err);
            // Already imported or doesn't exists
        }
    }

    render() {
        const {page, user, detail, component: Component} = this.state;

        return (
            <div>
                {Component && <Component {...this.props} user={user} detail={detail} />}
            </div>
        )
    }
}

const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#ffffff',
            main: '#ffffff',
            contrastText: 'rgb(115, 115, 115)',
        },
        secondary: {
            light: '#448AFF',
            main: '#448AFF',
            contrastText: '#fff',
        },
        // secondary: cyan.A700
    }
});


ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <App/>
    </MuiThemeProvider>,
    document.getElementById('root'));