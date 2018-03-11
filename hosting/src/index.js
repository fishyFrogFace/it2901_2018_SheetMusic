import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';

import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';

import 'firebase/firestore';
import 'firebase/auth';

class App extends React.Component {
    state = {
        user: {
            defaultBand: {}
        }
    };

    unsubscribeCallbacks = [];

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
                    let bandRef = await firebase.firestore().collection('bands').add({
                        name: `${user.displayName.split(' ')[0]}'s band`,
                        creator: firebase.firestore().doc(`users/${userSnapshot.id}`),
                        code: Math.random().toString(36).substring(2, 7)
                    });

                    const instrumentRefs = (await firebase.firestore().collection('instruments').get()).docs.map(doc => doc.ref);
                    await Promise.all(instrumentRefs.map(ref => bandRef.collection('instruments').add({ref: ref})));

                    await userSnapshot.ref.set({
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        defaultBand: bandRef
                    });

                    await userSnapshot.ref.collection('bands').add({ref: bandRef});
                }

                for (const cb of this.unsubscribeCallbacks) {
                    cb();
                }

                const band = (await userSnapshot.ref.get()).data().defaultBand;

                // Add everything except defaultBand
                this.setState({
                    user: {
                        ...this.state.user,
                        displayName: userSnapshot.data().displayName,
                        photoURL: userSnapshot.data().photoURL,
                        email: userSnapshot.data().email,
                        id: userSnapshot.id
                    }
                });

                this.unsubscribeCallbacks.push(
                    band.onSnapshot(snapshot => {
                        this.setState({user: {...this.state.user, defaultBand: {...this.state.user.defaultBand, ...snapshot.data(), id: snapshot.id}}});
                    })
                );

                this.unsubscribeCallbacks.push(
                    band.collection('scores').onSnapshot(async snapshot => {
                        for (let change of snapshot.docChanges) {
                            switch (change.type) {
                                case 'added':
                                    const scoreDoc = await change.doc.data().ref.get();

                                    this.unsubscribeCallbacks.push(
                                        scoreDoc.ref.collection('parts').onSnapshot(async snapshot => {
                                            const parts = await Promise.all(
                                                snapshot.docs.map(async doc => {
                                                    const instrumentRef = await doc.data().instrument.get();
                                                    return {...doc.data(), id: doc.id, instrument: instrumentRef.data()}
                                                })
                                            );

                                            const scores = [...this.state.user.defaultBand.scores];

                                            scores.find(score => score.id === scoreDoc.id).parts = parts;

                                            this.setState({user: {...this.state.user, defaultBand: {...this.state.user.defaultBand, scores: scores}}})
                                        })
                                    );

                                    const scores = [...(this.state.user.defaultBand.scores || []), {
                                        ...scoreDoc.data(),
                                        id: scoreDoc.id
                                    }];

                                    this.setState({user: {...this.state.user, defaultBand: {...this.state.user.defaultBand, scores: scores}}});
                                    break;
                                case 'modified':
                                    break;
                            }
                        }
                    })
                );

                this.unsubscribeCallbacks.push(
                    band.collection('members').onSnapshot(async snapshot => {
                        const members = await Promise.all(snapshot.docs.map(async doc => {
                            const memberDoc = await doc.data().ref.get();
                            return {id: memberDoc.id, ...memberDoc.data()};
                        }));

                        this.setState({user: {...this.state.user, defaultBand: {...this.state.user.defaultBand, members: members}}});
                    })
                );

                this.unsubscribeCallbacks.push(
                    band.collection('pdfs').onSnapshot(snapshot => {
                        const pdfs = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
                        const pdfsSorted = pdfs.sort((a, b) => a.name.localeCompare(b.name));
                        this.setState({user: {...this.state.user, defaultBand: {...this.state.user.defaultBand, pdfs: pdfsSorted}}});
                    })
                );


                this.unsubscribeCallbacks.push(
                    band.collection('instruments').onSnapshot(async snapshot => {
                        const instruments = await Promise.all(
                            snapshot.docs.map(async doc => {
                                const instrumentRef = await doc.data().ref.get();
                                return {...instrumentRef.data(), id: instrumentRef.id};
                            })
                        );

                        const instrumentsSorted = instruments.sort((a, b) => a.name.localeCompare(b.name));
                        this.setState({user: {...this.state.user, defaultBand: {...this.state.user.defaultBand, instruments: instrumentsSorted}}});
                    })
                );
            });

            this.unsubscribeCallbacks.push(
                firebase.firestore().collection(`users/${user.uid}/bands`).onSnapshot(async snapshot => {
                    const bandDocs = await Promise.all(snapshot.docs.map(doc => doc.data().ref.get()));
                    const bandData = bandDocs.map(doc => ({...doc.data(), id: doc.id}));

                    this.setState({user: {...this.state.user, bands: bandData}});
                })
            );
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
                {Component && <Component {...this.props} user={user} detail={detail}/>}
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