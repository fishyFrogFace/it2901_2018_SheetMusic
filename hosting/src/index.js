import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';

import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';
import {MuiPickersUtilsProvider} from 'material-ui-pickers';
import MomentUtils from 'material-ui-pickers/utils/moment-utils';

import 'firebase/firestore';
import 'firebase/auth';

class App extends React.Component {
    state = {
        user: {},
        band: {},
        score: {},
        pdf: {}
    };

    scoreUnsubscribeCallbacks = [];
    bandUnsubscribeCallbacks = [];
    pdfUnsubscribeCallbacks = [];

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
                    const instrumentRefs = (await firebase.firestore().collection('instruments').get()).docs.map(doc => doc.ref);

                    let bandRef = await firebase.firestore().collection('bands').add({
                        name: `${user.displayName.split(' ')[0]}'s band`,
                        creator: userSnapshot.ref,
                        code: Math.random().toString(36).substring(2, 7),
                        instrumentRefs: instrumentRefs,
                        memberRefs: [userSnapshot.ref]
                    });

                    await userSnapshot.ref.set({
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        defaultBandRef: bandRef,
                        bandRefs: [bandRef]
                    });

                    return;
                }

                const userData = userSnapshot.data();
                const userId = userSnapshot.id;

                this.bandUnsubscribeCallbacks.forEach(cb => cb());

                this.bandUnsubscribeCallbacks.push(
                    userData.defaultBandRef.onSnapshot(async snapshot => {
                        this.setState({band: {...this.state.band, ...snapshot.data(), id: snapshot.id}});

                        const instruments = await Promise.all((snapshot.data().instrumentRefs || []).map(async instrumentRef => {
                            const instrumentDoc = await instrumentRef.get();
                            return {...instrumentDoc.data(), id: instrumentDoc.id}
                        }));

                        this.setState({band: {...this.state.band, instruments}});

                        const members = await Promise.all((snapshot.data().memberRefs || []).map(async memberRef => {
                            const memberDoc = await memberRef.get();
                            return {...memberDoc.data(), id: memberDoc.id}
                        }));

                        this.setState({band: {...this.state.band, members}});
                    })
                );

                const createListener = name => {
                    return userData.defaultBandRef.collection(name).onSnapshot(async snapshot => {
                        const items = await Promise.all(
                            snapshot.docs.map(async doc => ({...doc.data(), id: doc.id}))
                        );

                        this.setState({band: {...this.state.band, [name]: items}});
                    })
                };

                this.bandUnsubscribeCallbacks.push(createListener('scores'));
                this.bandUnsubscribeCallbacks.push(createListener('setlists'));
                this.bandUnsubscribeCallbacks.push(createListener('pdfs'));

                const bands = await Promise.all(userSnapshot.data().bandRefs.map(async bandRef => {
                    const bandDoc = await bandRef.get();
                    return {...bandDoc.data(), id: bandDoc.id}
                }));

                this.setState({user: {...this.state.user, ...userData, bands: bands, id: userId}});
            });
        }

        let hash = (() => {
            if (user && window.location.hash === '#/signin') {
                return '#/scores';
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
        const hash = window.location.hash || '#/scores';

        let [page, detail] = hash.split('/').slice(1);


        if (page === 'setlist') {
        //
        }

        if (page === 'score') {
            const [bandId, scoreId] = [detail.slice(0, 20), detail.slice(20)];

            this.scoreUnsubscribeCallbacks.forEach(cb => cb());

            const scoreDoc = firebase.firestore().doc(`bands/${bandId}/scores/${scoreId}`);

            this.scoreUnsubscribeCallbacks.push(
                scoreDoc.onSnapshot(async snapshot => {
                    this.setState({score: {...this.state.score, ...snapshot.data()}});
                })
            );

            this.scoreUnsubscribeCallbacks.push(
                scoreDoc.collection('parts').onSnapshot(async snapshot => {
                    const parts = await Promise.all(
                        snapshot.docs.map(async doc => ({
                            ...doc.data(),
                            id: doc.id,
                            instrument: (await doc.data().instrumentRef.get()).data()
                        }))
                    );

                    const partsSorted = parts
                        .sort((a, b) => `${a.instrument.name} ${a.instrumentNumber}`.localeCompare(`${b.instrument.name} ${b.instrumentNumber}`));

                    this.setState({score: {...this.state.score, parts: partsSorted}});
                })
            );
        }

        if (page === 'pdf') {
            const [bandId, pdfId] = [detail.slice(0, 20), detail.slice(20)];

            this.pdfUnsubscribeCallbacks.forEach(cb => cb());

            const pdfDoc = firebase.firestore().doc(`bands/${bandId}/pdfs/${pdfId}`);

            this.pdfUnsubscribeCallbacks.push(
                pdfDoc.onSnapshot(async snapshot => {
                    this.setState({pdf: {...this.state.pdf, ...snapshot.data(), id: snapshot.id}});
                })
            );
        }

        const page2component = {
            members: 'Home',
            scores: 'Home',
            setlists: 'Home',
            pdfs: 'Home',
            pdf: 'PDF',
            score: 'Score',
            setlist: 'Setlist',
            signin: 'SignIn'
        };

        try {
            const component = (await import(`./containers/${page2component[page]}.js`)).default;

            this.setState({page: page, Component: component});
        } catch (err) {
            console.log(err);
            // Already imported or doesn't exists
        }
    }

    render() {
        const {page, user, band, score, pdf, Component} = this.state;

        if (!Component) {
            return <div>Loading...</div>
        }

        return (
            <div style={{height: '100%'}}>
                <Component
                    {...this.props}
                    user={user}
                    band={band}
                    score={score}
                    pdf={pdf}
                    page={page}/>
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
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <App/>
        </MuiPickersUtilsProvider>
    </MuiThemeProvider>,
    document.getElementById('root'));