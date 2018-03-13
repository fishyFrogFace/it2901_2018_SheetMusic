import React from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {Button, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Snackbar,} from "material-ui";

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

const styles = {
    root: {
        height: '100%'
    },
    flex: {
        flex: 1
    },

    appBar: {},

    dialogContent: {
        display: 'flex',
        flexDirection: 'column'
    },
    banner: {
        background: 'url(https://4.bp.blogspot.com/-vq0wrcE-1BI/VvQ3L96sCUI/AAAAAAAAAI4/p2tb_hJnwK42cvImR4zrn_aNly7c5hUuQ/s1600/BandPeople.jpg) center center no-repeat',
        backgroundSize: 'cover',
        height: 144
    },

    content: {},

    instrumentSelector: {
        marginLeft: 25
    },

    instrumentSelector__select: {
        color: 'white'
    },
    instrumentSelector__icon: {
        fill: 'white'
    },

    button__label: {
        width: 130,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block'
    }
};

class Home extends React.Component {
    state = {
        anchorEl: null,
        selectedPage: 0,
        uploadSheetsDialogOpen: false,
        message: null,
        windowSize: null
    };

    componentWillMount() {
        this.setState({windowSize: window.innerWidth < 800 ? 'mobile' : 'desktop'});

        window.onresize = event => {
            if (event.target.innerWidth < 800 && this.state.windowSize === 'desktop') {
                this.setState({windowSize: 'mobile'});
            }

            if (event.target.innerWidth > 800 && this.state.windowSize === 'mobile') {
                this.setState({windowSize: 'desktop'});
            }
        };
    }

    _onNavClick = index => {
        this.setState({selectedPage: index});
    };

    _onAddFullScore = async (score, parts) => {
        const bandId = this.props.band.id;

        let scoreRef;
        if (score.id) {
            scoreRef = firebase.firestore().doc(`scores/${score.id}`);
        } else {
            scoreRef = await firebase.firestore().collection('scores').add({
                title: score.title || 'Untitled Score',
                composer: score.composer || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            await firebase.firestore().collection(`bands/${bandId}/scores`).add({
                ref: scoreRef
            })
        }

        const partsSnapshot = await scoreRef.collection('parts').get();
        await Promise.all(partsSnapshot.docs.map(doc => doc.ref.delete()));

        for (let part of parts) {
            await scoreRef.collection('parts').add({
                pagesCropped: part.pagesCropped,
                pagesOriginal: part.pagesOriginal,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                instrument: firebase.firestore().doc(`instruments/${part.instrumentId}`),
                instrumentNumber: part.instrumentNumber
            });
        }

        this.setState({message: 'Score added'});
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.setState({message: null});
    };

    _onAddParts = async (score, parts) => {
        const bandId = this.props.band.id;

        let scoreRef;
        if (score.id) {
            scoreRef = firebase.firestore().doc(`scores/${score.id}`);
        } else {
            scoreRef = await firebase.firestore().collection('scores').add({
                title: score.title || 'Untitled Score',
                composer: score.composer || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await firebase.firestore().collection(`bands/${bandId}/scores`).add({
                ref: scoreRef
            })
        }

        for (let part of parts) {
            const pdfDocRef = firebase.firestore().doc(`bands/${bandId}/pdfs/${part.pdfId}`);

            const doc = await pdfDocRef.get();

            await scoreRef.collection('parts').add({
                pagesCropped: doc.data().pagesCropped,
                pagesOriginal: doc.data().pagesOriginal,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                instrument: firebase.firestore().doc(`instruments/${part.instrumentId}`),
                instrumentNumber: part.instrumentNumber
            });
        }

        this.setState({message: 'Parts added'});
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.setState({message: null});
    };

    _onAddPart = async (score, part) => {
        const bandId = this.props.band.id;

        let scoreRef;
        if (score.id) {
            scoreRef = firebase.firestore().doc(`scores/${score.id}`);
        } else {
            scoreRef = await firebase.firestore().collection('scores').add({
                title: score.title || 'Untitled Score',
                composer: score.composer || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            await firebase.firestore().collection(`bands/${bandId}/scores`).add({
                ref: scoreRef
            })
        }

        await scoreRef.collection('parts').add({
            pagesCropped: part.pagesCropped,
            pagesOriginal: part.pagesOriginal,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            instrument: firebase.firestore().doc(`instruments/${part.instrumentId}`),
            instrumentNumber: part.instrumentNumber
        });

        this.setState({message: 'Part added'});
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.setState({message: null});
    };

    _onFileChange = async e => {
        // https://reactjs.org/docs/events.html#event-pooling
        e.persist();

        if (!e.target.files.length) return;

        this.setState({message: 'Uploading...'});

        await Promise.all(
            Array.from(e.target.files).map(file =>
                firebase.storage().ref(`bands/${this.props.band.id}/input/${file.name}`).put(file)
            )
        );

        this.setState({message: null});
    };

    _onFileUploadButtonClick = () => {
        this.fileBrowser.click();
    };

    _onBandClick = e => {
        this.setState({anchorEl: e.currentTarget})
    };

    _onCreateBand = async () => {
        this.setState({anchorEl: null});

        const {name} = await this.createDialog.open();

        const {user} = this.props;

        try {
            const band = {
                name: name,
                creator: firebase.firestore().doc(`users/${user.id}`),
                code: Math.random().toString(36).substring(2, 7)
            };

            let bandRef = await firebase.firestore().collection('bands').add(band);

            const instrumentRefs = (await firebase.firestore().collection('instruments').get()).docs.map(doc => doc.ref);
            await Promise.all(instrumentRefs.map(ref => bandRef.collection('instruments').add({ref: ref})));

            await firebase.firestore().doc(`users/${user.id}`).update({defaultBand: bandRef});
            await firebase.firestore().collection(`users/${user.id}/bands`).add({ref: bandRef});
        } catch (err) {
            console.log(err);
        }
    };

    _onJoinBand = async () => {
        this.setState({anchorEl: null});

        const {code} = await this.joinDialog.open();

        const {user} = this.props;

        let bandSnapshot = await firebase.firestore().collection('bands').where('code', '==', code).get();

        if (bandSnapshot.docs.length > 0) {
            let bandRef = firebase.firestore().doc(`bands/${bandSnapshot.docs[0].id}`);

            let userBandSnapshot = await firebase.firestore().collection(`users/${user.id}/bands`).where('ref', '==', bandRef).get();

            if (userBandSnapshot.docs.length > 0) {
                this.setState({message: 'Band already joined!'});
            } else {
                await firebase.firestore().collection(`users/${user.id}/bands`).add({ref: bandRef});
                await bandRef.collection('members').add({ref: firebase.firestore().doc(`users/${user.id}`)});
                await firebase.firestore().doc(`users/${user.id}`).update({defaultBand: bandRef})
            }
        } else {
            this.setState({message: 'Band does not exist!'});
        }

        await new Promise(resolve => setTimeout(resolve, 3000));

        this.setState({message: null})
    };

    _onBandSelect = async bandId => {
        this.setState({anchorEl: null});
        await firebase.firestore().doc(`users/${this.props.user.id}`).update({
            defaultBand: firebase.firestore().doc(`bands/${bandId}`)
        });
    };

    _onCreateSetlist = async () => {
        let userId = this.props.user.id;
        let bandId = this.props.band.id;

        const {title, place, date} = await this.setlistDialog.open();

        try {
            const setlist = {
                title: title,
                place: place,
                date: date._d,
                creator: firebase.firestore().doc(`users/${userId}`),
                band: firebase.firestore().doc(`bands/${bandId}`)
            };

            let ref = await firebase.firestore().collection('setlists').add(setlist);

            await firebase.firestore().collection(`bands/${bandId}/setlists`).add({
                ref: firebase.firestore().doc(`setlists/${ref.id}`)
            });
            window.location.hash = `#/setlist/${ref.id}`;
        } catch (err) {
            console.log(err);
        }
    };

    render() {
        const {anchorEl, selectedPage, message, windowSize} = this.state;

        const {classes, user, band} = this.props;

        return <div className={classes.root}>
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
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
                    <SearchBar/>
                    <div style={{flex: 1}}/>
                    <Menu
                        style={{marginLeft: 10}}
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={e => this.setState({anchorEl: null})}
                    >
                        <MenuItem onClick={this._onCreateBand} style={{height: 15}}>
                            Create band
                        </MenuItem>
                        <MenuItem onClick={this._onJoinBand} style={{height: 15}}>
                            Join Band
                        </MenuItem>
                        <div style={{height: '1px', background: 'rgba(0,0,0,0.12)', margin: '8px 0'}}/>
                        {
                            user.bands && user.bands.map((band, index) =>
                                <MenuItem style={{height: 15}} key={index}
                                          onClick={() => this._onBandSelect(band.id)}>
                                    {band.name}
                                </MenuItem>
                            )
                        }
                    </Menu>
                    <IconButton color="inherit" onClick={() => this._onFileUploadButtonClick()}>
                        <FileUpload/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <div style={{display: 'flex', paddingTop: 64, height: '100%', overflow: 'hidden', boxSizing: 'border-box'}}>
                <div style={{
                    width: 220,
                    paddingTop: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxSizing: 'border-box'
                }}>
                    <List>
                        {['Scores', 'Setlists', 'Members', 'Unsorted PDFs'].map((name, index) => {
                            const selected = index === selectedPage;
                            const color = selected ? '#448AFF' : '#757575';
                            return <ListItem style={{paddingLeft: 24}} key={index} button
                                             onClick={() => this._onNavClick(index)}>
                                {name === 'Scores' && <LibraryMusic style={{color: color}}/>}
                                {name === 'Setlists' && <QueueMusic style={{color: color}}/>}
                                {name === 'Members' && <SupervisorAccount style={{color: color}}/>}
                                {name === 'Unsorted PDFs' && <LibraryBooks style={{color: color}}/>}
                                <ListItemText
                                    disableTypography
                                    inset
                                    primary={<Typography type="body2" style={{color: color}}>{name}</Typography>}
                                />
                            </ListItem>
                        })}
                    </List>
                    <div style={{flex: 1}}/>
                    <div style={{paddingLeft: 24, paddingBottom: 24}}>
                        <Typography variant='caption'>Band code: {band.code}</Typography>
                    </div>
                </div>
                <div style={{flex: 1, height: '100%', overflowY: 'auto'}}>
                    {
                        selectedPage === 0 &&
                        <Scores band={band}/>
                    }
                    {
                        selectedPage === 1 &&
                        <Setlists
                            band={band}
                            onCreateSetlist={this._onCreateSetlist}
                        />
                    }
                    {
                        selectedPage === 2 &&
                        <Members band={band}/>
                    }
                    {
                        selectedPage === 3 &&
                        <UnsortedPDFs
                            band={band}
                            onAddFullScore={this._onAddFullScore}
                            onAddParts={this._onAddParts}
                            onAddPart={this._onAddPart}
                        />
                    }
                </div>
            </div>
            <CreateSetlistDialog onRef={ref => this.setlistDialog = ref}/>
            <CreateBandDialog onRef={ref => this.createDialog = ref}/>
            <JoinBandDialog onRef={ref => this.joinDialog = ref}/>
            <input
                ref={ref => this.fileBrowser = ref}
                type='file'
                style={{display: 'none'}}
                onChange={this._onFileChange}
                multiple
            />
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                open={Boolean(message)}
                message={message}
            />
        </div>
    }
}


export default withStyles(styles)(Home);