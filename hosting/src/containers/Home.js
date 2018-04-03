import React from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {
    Button, CircularProgress, IconButton, List, ListItem, ListItemText, Menu, MenuItem,
    Snackbar
} from "material-ui";

import firebase from 'firebase';
import CreateSetlistDialog from "../components/dialogs/CreateSetlistDialog";
import UnsortedPDFs from "./Home/UnsortedPDFs";

import {FileUpload, LibraryBooks, LibraryMusic, QueueMusic, SupervisorAccount} from "material-ui-icons";
import CreateBandDialog from "../components/dialogs/CreateBandDialog";
import JoinBandDialog from "../components/dialogs/JoinBandDialog";
import SearchBar from '../components/SearchBar';
import Members from "./Home/Members";
import Scores from "./Home/Scores";
import Setlists from "./Home/Setlists";
import UploadDialog from "../components/dialogs/UploadDialog";
import levenshtein from 'fast-levenshtein';


const styles = {
    root: {
        height: '100%',
        display: 'grid',
        gridTemplateRows: '56px 1fr min-content',
        gridTemplateColumns: '220px auto',
    },

    flex: {
        flex: 1
    },

    button__label: {
        width: 130,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block'
    },

    appBarContainer: {
        gridRow: 1,
        gridColumn: '1 / -1'
    },

    content: {
        overflowY: 'auto',
        position: 'relative'
    },

    absoluteCenter: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    }
};

class Home extends React.Component {
    state = {
        bandAnchorEl: null,
        uploadAnchorEl: null,
        uploadSheetsDialogOpen: false,
        message: null,
        windowSize: null,

        band: {},
        bands: null,

        pdfSelected: false
    };

    unsubs = [];

    componentWillMount() {
        this.setState({windowSize: window.innerWidth < 780 ? 'mobile' : 'desktop'});

        window.onresize = event => {
            if (event.target.innerWidth < 780 && this.state.windowSize === 'desktop') {
                this.setState({windowSize: 'mobile'});
            }

            if (event.target.innerWidth > 780 && this.state.windowSize === 'mobile') {
                this.setState({windowSize: 'desktop'});
            }
        };
    }

    async createScoreDoc(band, scoreData) {
        const data = {};
        data.title = scoreData.title || 'Untitled Score';

        if (scoreData.composer) {
            data.composer = scoreData.composer;
        }

        if (scoreData.arranger) {
            data.arranger = scoreData.arranger;
        }

        if (scoreData.extraInstruments) {
            data.arranger = scoreData.extraInstruments;
        }

        if (scoreData.tempo) {
            data.tempo = scoreData.tempo;
        }

        if (scoreData.genres && scoreData.genres.length > 0) {
            data.genres = scoreData.genres;
        }

        if (scoreData.tags && scoreData.tags.length > 0) {
            data.tags = scoreData.tags;
        }

        return await firebase.firestore().collection(`bands/${band.id}/scores`).add({
            ...data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        })
    }

    _onAddFullScore = async (scoreData, parts, pdf) => {
        const {band} = this.state;

        this.setState({message: 'Adding score...'});

        let scoreRef;
        if (scoreData.id) {
            scoreRef = firebase.firestore().doc(`bands/${band.id}/scores/${scoreData.id}`);
        } else {
            scoreRef = await this.createScoreDoc(band, scoreData);
        }

        const partsSnapshot = await scoreRef.collection('parts').get();
        await Promise.all(partsSnapshot.docs.map(doc => doc.ref.delete()));

        await Promise.all(
            parts.map(part => scoreRef.collection('parts').add({
                    pages: part.pages,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    instrumentRef: scoreRef.parent.parent.collection('instruments').doc(`${part.instrumentId}`),
                })
            ));

        await firebase.firestore().doc(`bands/${band.id}/pdfs/${pdf.id}`).delete();
        this.setState({message: null});
    };

    _onAddParts = async (scoreData, parts) => {
        const {band} = this.state;

        this.setState({message: 'Adding parts...'});

        let scoreRef;
        if (scoreData.id) {
            scoreRef = firebase.firestore().doc(`bands/${band.id}/scores/${scoreData.id}`);
        } else {
            scoreRef = await this.createScoreDoc(band, scoreData);
        }

        for (let part of parts) {
            const pdfDoc = await firebase.firestore().doc(`bands/${band.id}/pdfs/${part.pdfId}`).get();

            await scoreRef.collection('parts').add({
                pages: pdfDoc.data().pages,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                instrumentRef: scoreRef.parent.parent.collection('instruments').doc(`${part.instrumentId}`),
            });

            await pdfDoc.ref.delete();
        }

        this.setState({message: null});
    };

    _onBandClick = e => {
        this.setState({bandAnchorEl: e.currentTarget})
    };

    _onCreateBand = async () => {
        this.setState({bandAnchorEl: null});

        const {name, instruments} = await this.createDialog.open();

        this.setState({message: 'Creating band...'});

        const user = firebase.auth().currentUser;

        const userRef = firebase.firestore().doc(`users/${user.uid}`);

        const userDoc = await userRef.get();

        try {
            let bandRef = await firebase.firestore().collection('bands').add({
                name: name,
                creatorRef: firebase.firestore().doc(`users/${user.uid}`),
                code: Math.random().toString(36).substring(2, 7),
            });

            await firebase.firestore().doc(`users/${user.uid}`).update({
                defaultBandRef: bandRef,
                bandRefs: [...(userDoc.data().bandRefs || []), bandRef],
            });

            await Promise.all(instruments.map(instrument => bandRef.collection('instruments').add({name: instrument})));
        } catch (err) {
            console.log(err);
        }

        this.setState({message: null})
    };

    _onJoinBand = async () => {
        this.setState({bandAnchorEl: null});

        const {code} = await this.joinDialog.open();

        const user = firebase.auth().currentUser;

        const userRef = firebase.firestore().doc(`users/${user.uid}`);

        let bandSnapshot = await firebase.firestore().collection('bands').where('code', '==', code).get();

        if (bandSnapshot.docs.length > 0) {
            const bandRef = firebase.firestore().doc(`bands/${bandSnapshot.docs[0].id}`);

            let userBandRefs = (await userRef.get()).data() || [];

            if (userBandRefs.some(ref => ref.id === bandRef.id)) {
                this.setState({message: 'Band already joined!'});
            } else {
                this.setState({message: 'Joining band...'});

                await bandRef.collection('members').add({ref: userRef});

                await userRef.update({
                    defaultBandRef: bandRef,
                    bandRefs: [...userBandRefs, bandRef]
                })
            }
        } else {
            this.setState({message: 'Band does not exist!'});
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.setState({message: null});
        }

        this.setState({message: null});
    };

    _onBandSelect = async bandId => {
        this.setState({bandAnchorEl: null});
        const user = firebase.auth().currentUser;
        await firebase.firestore().doc(`users/${user.uid}`).update({
            defaultBandRef: firebase.firestore().doc(`bands/${bandId}`)
        });
    };

    _onCreateSetlist = async () => {
        const user = firebase.auth().currentUser;

        const {band} = this.state;

        const {title, date} = await this.setlistDialog.open();

        this.setState({message: 'Creating setlist...'});

        try {
            let setlistRef = await firebase.firestore().collection(`bands/${band.id}/setlists`).add({
                title: title,
                date: date,
                creatorRef: firebase.firestore().doc(`users/${user.uid}`)
            });

            window.location.hash = `#/setlist/${band.id}${setlistRef.id}`;
        } catch (err) {
            console.log(err);
        }

        this.setState({message: null});
    };

    _onNavClick = nameShort => {
        window.location.hash = `/${nameShort}`;
    };

    _onFileUploadButtonClick = e => {
        this.setState({uploadAnchorEl: e.currentTarget});
    };

    _onUploadMenuClick = async type => {
        const {files, path, accessToken} = await this.uploadDialog.open(type);

        const {band} = this.state;

        this.setState({uploadAnchorEl: null});

        switch (type) {
            case 'computer':
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    this.setState({message: `Uploading file ${i + 1}/${files.length}...`});
                    await firebase.storage().ref(`${band.id}/${file.name}`).put(file);
                }
                this.setState({message: null});
                break;
            case 'dropbox':
                const response = await fetch(`https://us-central1-scores-butler.cloudfunctions.net/uploadFromDropbox?bandId=${band.id}&folderPath=${path}&accessToken=${accessToken}`);
                console.log(response.status);
                break;
            case 'drive':
                break;
        }
    };

    _onMenuClose = () => {
        this.setState({bandAnchorEl: null, uploadAnchorEl: null});
    };

    async componentDidUpdate(prevProps, prevState) {
        const user = firebase.auth().currentUser;

        const {page, loaded} = this.props;
        const {bands, band, windowSize} = this.state;

        if (page !== prevProps.page) {
            this.unsubs.forEach(unsub => unsub());

            this.unsubs.push(
                firebase.firestore().doc(`users/${user.uid}`).onSnapshot(async snapshot => {
                    if (!snapshot.exists) {
                        await snapshot.ref.set({
                            email: user.email,
                            displayName: user.displayName,
                            photoURL: user.photoURL,
                        });

                        return;
                    }

                    const data = snapshot.data();

                    if (!data.bandRefs) {
                        this.setState({bands: []});
                        return;
                    }

                    this.unsubs.push(
                        data.defaultBandRef.onSnapshot(async snapshot => {
                            this.setState({band: {...this.state.band, ...snapshot.data(), id: snapshot.id}});
                        })
                    );

                    this.unsubs.push(
                        data.defaultBandRef.collection(page).onSnapshot(async snapshot => {
                            let items = await Promise.all(
                                snapshot.docs.map(async doc => ({...doc.data(), id: doc.id}))
                            );

                            if (page === 'pdfs') {
                                const groups = [];
                                const visited = [];

                                for (let item of items) {
                                    if (item.pages && item.pages.length > 10) {
                                        groups.push({
                                            name: item.name,
                                            item: item,
                                            type: 'full'
                                        })
                                    } else {
                                        const similarItems = [];

                                        if (visited.includes(item.id)) continue;

                                        for (let _item of items) {
                                            if (_item.id !== item.id &&
                                                !visited.includes(_item.id) &&
                                                levenshtein.get(item.name, _item.name) < 5) {
                                                similarItems.push(_item);
                                                visited.push(_item.id);
                                            }
                                        }

                                        groups.push({
                                            name: item.name.split('-')[0].trimRight(),
                                            items: [item, ...similarItems],
                                            type: 'part'
                                        })
                                    }
                                }

                                items = groups
                                    .map(group => ({...group, name: `${group.name[0].toUpperCase()}${group.name.slice(1)}`}))
                                    .sort((a, b) => a.name.localeCompare(b.name));
                            }

                            this.setState({band: {...this.state.band, [page]: items}});
                        })
                    );

                    this.unsubs.push(
                        data.defaultBandRef.collection('instruments').onSnapshot(async snapshot => {
                            let items = await Promise.all(
                                snapshot.docs.map(async doc => ({...doc.data(), id: doc.id}))
                            );

                            this.setState({band: {...this.state.band, instruments: items}});
                        })
                    );

                    const bands = await Promise.all(
                        data.bandRefs.map(async bandRef =>
                            ({...(await bandRef.get()).data(), id: bandRef.id})
                        )
                    );

                    this.setState({bands: bands});
                })
            );
        }

        const options = {
            duration: 200,
            fill: 'both',
            easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
        };

        if (!prevState.band.pdfs && band.pdfs ||
            !prevState.band.scores && band.scores ||
            !prevState.band.setlists && band.setlists) {

            await this.contentEl.animate([
                {transform: 'translateY(70px)', opacity: 0},
                {transform: 'none', opacity: 1}
            ], options).finished;
        }

        if (!loaded) {
            if ((prevState.bands || []).length === 0 && (bands && bands.length > 0)) {
                await this.navEl.animate([{transform: 'none'}], options).finished;
                await this.appBarContainerEl.animate([{transform: 'none'}], options).finished;
            }
        }
    }

    _onPDFSelect = selectedPDFs => {
        this.setState({pdfSelected: selectedPDFs.size > 0});
    };

    render() {
        const {bandAnchorEl, uploadAnchorEl, message, windowSize, band, bands, pdfSelected} = this.state;

        const user = firebase.auth().currentUser;

        const {classes, page, loaded} = this.props;

        const pages = [['Scores', 'scores'], ['Setlists', 'setlists'], ['Members', 'members'], ['Unsorted PDFs', 'pdfs']];

        return <div className={classes.root}>
            {
                !bands && !loaded &&
                <div className={classes.absoluteCenter} ref={ref => this.progressEl = ref}>
                    <CircularProgress color='secondary' size={50}/>
                </div>
            }
            <div className={classes.appBarContainer} style={{transform: loaded ? 'none' : 'translateY(-70px)'}}
                 ref={ref => this.appBarContainerEl = ref}>
                {
                    !pdfSelected &&
                    <AppBar position='static'>
                        <Toolbar style={{minHeight: 56}}>
                            {
                                windowSize === 'desktop' &&
                                <Typography variant='headline' color='textSecondary'>ScoreButler</Typography>
                            }
                            {
                                windowSize === 'desktop' &&
                                <div style={{height: 32, width: 1, margin: '0 15px', background: 'rgba(0,0,0,0.12)'}}/>
                            }

                            <Button
                                onClick={this._onBandClick}
                                size='small'
                                classes={{label: classes.button__label}}
                                style={{color: 'rgb(115, 115, 115)', marginRight: 10}}
                            >
                                {band.name || ''}
                            </Button>
                            <Menu
                                anchorEl={bandAnchorEl}
                                open={Boolean(bandAnchorEl)}
                                onClose={this._onMenuClose}
                            >
                                <MenuItem onClick={this._onCreateBand} style={{height: 15}}>
                                    Create band
                                </MenuItem>
                                <MenuItem onClick={this._onJoinBand} style={{height: 15}}>
                                    Join Band
                                </MenuItem>
                                <div style={{height: '1px', background: 'rgba(0,0,0,0.12)', margin: '8px 0'}}/>
                                {
                                    bands && bands.map((band, index) =>
                                        <MenuItem style={{height: 15}} key={index}
                                                  onClick={() => this._onBandSelect(band.id)}>
                                            {band.name}
                                        </MenuItem>
                                    )
                                }
                            </Menu>
                            <SearchBar bandId={band.id}/>
                            <div style={{flex: 1}}/>
                            <IconButton style={{marginLeft: 10}} color="inherit"
                                        onClick={this._onFileUploadButtonClick}>
                                <FileUpload/>
                            </IconButton>
                            <Menu
                                anchorEl={uploadAnchorEl}
                                open={Boolean(uploadAnchorEl)}
                                onClose={this._onMenuClose}
                            >
                                <MenuItem onClick={() => this._onUploadMenuClick('computer')}>Choose from
                                    computer</MenuItem>
                                <MenuItem onClick={() => this._onUploadMenuClick('dropbox')}>Choose from
                                    Dropbox</MenuItem>
                            </Menu>
                        </Toolbar>
                    </AppBar>
                }
            </div>
            <div
                style={{
                    ...(windowSize === 'desktop' ? {
                        gridRow: 2,
                        gridColumn: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        boxSizing: 'border-box',
                        transform: loaded ? 'none' : 'translateX(-220px)'
                    } : {
                        gridRow: 3,
                        gridColumn: '1/-1',
                        display: 'flex',
                        justifyContent: 'space-around',
                        background: 'white',
                        height: '56px',
                        transform: loaded ? 'none' : 'translateY(56px)'
                    })
                }}
                ref={ref => this.navEl = ref}
            >
                {
                    windowSize === 'desktop' &&
                    <List>
                        {pages.map(([nameLong, nameShort]) => {
                            const selected = nameShort === page;
                            const color = selected ? '#448AFF' : '#757575';
                            return <ListItem style={{paddingLeft: 24}} key={nameShort} button
                                             onClick={() => this._onNavClick(nameShort)}>
                                {nameShort === 'scores' && <LibraryMusic style={{color: color}}/>}
                                {nameShort === 'setlists' && <QueueMusic style={{color: color}}/>}
                                {nameShort === 'members' && <SupervisorAccount style={{color: color}}/>}
                                {nameShort === 'pdfs' && <LibraryBooks style={{color: color}}/>}
                                <ListItemText
                                    disableTypography
                                    inset
                                    primary={<Typography type="body2"
                                                         style={{color: color}}>{nameLong}</Typography>}
                                />
                            </ListItem>
                        })}
                    </List>
                }
                {
                    windowSize === 'mobile' &&
                    pages.map(([nameLong, nameShort]) => {
                        const selected = nameShort === page;
                        const color = selected ? '#448AFF' : '#757575';

                        return <div key={nameShort} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            marginTop: -5
                        }}>
                            <IconButton onClick={() => this._onNavClick(nameShort)}>
                                {nameShort === 'scores' && <LibraryMusic style={{color: color}}/>}
                                {nameShort === 'setlists' && <QueueMusic style={{color: color}}/>}
                                {nameShort === 'members' && <SupervisorAccount style={{color: color}}/>}
                                {nameShort === 'pdfs' && <LibraryBooks style={{color: color}}/>}
                            </IconButton>
                            <Typography type="body1" style={{
                                color: color,
                                marginTop: -10,
                                fontSize: 11
                            }}>{nameLong}</Typography>
                        </div>
                    })
                }
            </div>
            <div
                className={classes.content}
                style={{
                    opacity: loaded ? 1 : 0,
                    ...(windowSize === 'desktop' ? {gridRow: '2/-1', gridColumn: 2} : {gridRow: 2, gridColumn: '1/-1'})
                }} ref={ref => this.contentEl = ref}
            >
                {
                    page === 'scores' &&
                    <Scores band={band}/>
                }
                {
                    page === 'setlists' &&
                    <Setlists
                        band={band}
                        onCreateSetlist={this._onCreateSetlist}
                    />
                }
                {
                    page === 'members' &&
                    <Members band={band}/>
                }
                {
                    page === 'pdfs' &&
                    <UnsortedPDFs
                        band={band}
                        onAddFullScore={this._onAddFullScore}
                        onAddParts={this._onAddParts}
                        onSelect={this._onPDFSelect}
                    />
                }
            </div>
            {
                bands && bands.length === 0 &&
                <div className={classes.absoluteCenter} ref={ref => this.wizardEl = ref}>
                    <Typography style={{marginBottom: 30}} variant='display1'>Hi {user.displayName.split(' ')[0]}! Do
                        you want to join or create a band?</Typography>
                    <div style={{display: 'flex', justifyContent: 'center'}}>
                        <Button onClick={this._onJoinBand} variant='raised' color='secondary' style={{marginRight: 20}}>Join
                            Band</Button>
                        <Button onClick={this._onCreateBand} variant='raised' color='secondary'>Create Band</Button>
                    </div>
                </div>
            }
            <CreateSetlistDialog onRef={ref => this.setlistDialog = ref}/>
            <CreateBandDialog onRef={ref => this.createDialog = ref}/>
            <JoinBandDialog onRef={ref => this.joinDialog = ref}/>
            <UploadDialog onRef={ref => this.uploadDialog = ref}/>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                open={Boolean(message)}
                message={message}
                action={message && message.includes('...') ? <CircularProgress size={30} color='secondary'/> : null}
            />
        </div>
    }
}


export default withStyles(styles)(Home);