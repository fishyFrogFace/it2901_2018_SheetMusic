import React from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {
    Avatar, Button, Card, CardContent, CardMedia, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Paper, Snackbar,
} from "material-ui";

import firebase from 'firebase';
import CreateSetlistDialog from "../components/dialogs/CreateSetlistDialog";
import UnsortedPDFs from "./Home/UnsortedPDFs";

import {
    ArrowDropDown, FileUpload, LibraryBooks, LibraryMusic, PlaylistAdd, QueueMusic,
    SupervisorAccount
} from "material-ui-icons";
import CreateBandDialog from "../components/dialogs/CreateBandDialog";
import JoinBandDialog from "../components/dialogs/JoinBandDialog";

const styles = {
    root: {
        height: '100%',
        overflow: 'hidden'
    },
    flex: {
        flex: 1
    },

    appBar: {},

    dialogContent: {
        display: 'flex',
        flexDirection: 'column'
    },
    card: {
        width: 270,
        marginRight: 24,
        marginBottom: 24,
        cursor: 'pointer'
    },
    media: {
        height: 150,
    },
    banner: {
        background: 'url(https://4.bp.blogspot.com/-vq0wrcE-1BI/VvQ3L96sCUI/AAAAAAAAAI4/p2tb_hJnwK42cvImR4zrn_aNly7c5hUuQ/s1600/BandPeople.jpg) center center no-repeat',
        backgroundSize: 'cover',
        height: 144
    },

    content: {},

    pageContainer: {
        display: 'flex',
        paddingTop: 20,
        justifyContent: 'center'
    },

    instrumentSelector: {
        marginLeft: 25
    },

    instrumentSelector__select: {
        color: 'white'
    },
    instrumentSelector__icon: {
        fill: 'white'
    },
};

class Home extends React.Component {
    state = {
        anchorEl: null,
        selectedPage: 3,
        uploadSheetsDialogOpen: false,
        message: null
    };

    _onAddButtonClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }

    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    _onMenuButtonClick() {

    }

    _onNavClick = index => {
        this.setState({selectedPage: index});
    };

    _onAddFullScore = async (score, instruments) => {
        const bandId = this.props.user.defaultBand.id;

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

        for (let instrument of instruments) {
            await scoreRef.collection('parts').add({
                pagesCropped: instrument.pagesCropped,
                pagesOriginal: instrument.pagesOriginal,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                instrument: firebase.firestore().doc(`instruments/${instrument.instrumentId}`)
            });
        }

        this.setState({message: 'Score added'});
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.setState({message: null});
    };

    _onAddParts = async (score, instruments) => {
        const bandId = this.props.user.defaultBand.id;

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

        for (let instrument of instruments) {
            const pdfDocRef = firebase.firestore().doc(`bands/${bandId}/pdfs/${instrument.pdfId}`);

            const doc = await pdfDocRef.get();

            await scoreRef.collection('parts').add({
                pagesCropped: doc.data().pagesCropped,
                pagesOriginal: doc.data().pagesOriginal,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                instrument: firebase.firestore().doc(`instruments/${instrument.instrumentId}`)
            });
        }

        this.setState({message: 'Parts added'});
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
                firebase.storage().ref(`bands/${this.props.user.defaultBand.id}/input/${file.name}`).put(file)
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

    render() {
        const {anchorEl, selectedPage, message} = this.state;

        const {classes, user} = this.props;

        const band = user.defaultBand;

        return (
            <div className={classes.root}>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        {
                            band.name && <Button onClick={this._onBandClick} style={{marginLeft: 50, color: 'rgb(115, 115, 115)'}}>
                                {band.name}
                                <ArrowDropDown/>
                            </Button>
                        }
                        <div className={classes.flex}/>
                        <Menu
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
                                    <MenuItem style={{height: 15}} key={index} onClick={() => this._onBandSelect(band.id)}>
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
                <div style={{display: 'flex', paddingTop: 64, height: 'calc(100% - 64px)', overflow: 'hidden'}}>
                    <div style={{width: 250, paddingTop: 20}}>
                        <List>
                            {['Scores', 'Setlists', 'Members', 'Unsorted PDFs'].map((name, index) => {
                                const props = index === selectedPage ? {style: {backgroundColor: 'rgba(0, 0, 0, 0.08)'}} : {};

                                return <ListItem key={index} button {...props} onClick={() => this._onNavClick(index)}>
                                    {name === 'Scores' && <LibraryMusic style={{color: '#757575'}}/>}
                                    {name === 'Setlists' && <QueueMusic style={{color: '#757575'}}/>}
                                    {name === 'Members' && <SupervisorAccount style={{color: '#757575'}}/>}
                                    {name === 'Unsorted PDFs' && <LibraryBooks style={{color: '#757575'}}/>}
                                    <ListItemText inset primary={name}/>
                                </ListItem>
                            })}
                        </List>
                    </div>
                    <div style={{flex: 1, height: '100%', overflowY: 'auto'}}>
                        {selectedPage === 0 &&
                        <div className={classes.pageContainer}>
                            <div style={{display: 'flex', width: 600, flexWrap: 'wrap'}}>
                                {band.scores && band.scores.map((arr, index) =>
                                    <Card key={index} className={classes.card}
                                          onClick={() => window.location.hash = `#/score/${arr.id}`}
                                          elevation={1}>
                                        <CardMedia
                                            className={classes.media}
                                            image="https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"
                                            title=""
                                        />
                                        <CardContent>
                                            <Typography variant="headline" component="h2">
                                                {arr.title}
                                            </Typography>
                                            <Typography component="p">
                                                {arr.composer}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                        }
                        {selectedPage === 1 &&
                        <div>Setlists</div>
                        }
                        {selectedPage === 2 &&
                        <div style={{display: 'flex', justifyContent: 'space-between', width: 600}}>
                            <Paper style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 15px',
                                width: 150,
                                height: 50
                            }}>
                                <Typography variant='body1'>
                                    Band code
                                </Typography>
                                <Typography variant='body1'>
                                    <b>{band.code}</b>
                                </Typography>
                            </Paper>
                            <Paper style={{width: 400}}>
                                <List>
                                    {band.members && band.members.map((member, index) =>
                                        <ListItem key={index} dense button>
                                            <Avatar src={member.photoURL}/>
                                            <ListItemText primary={member.displayName}/>
                                        </ListItem>)}
                                </List>
                            </Paper>
                        </div>
                        }
                        {selectedPage === 3 &&
                        <UnsortedPDFs
                            band={band}
                            onAddFullScore={this._onAddFullScore}
                            onAddParts={this._onAddParts}
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
                {selectedPage === 1 &&
                <Button variant="fab" color="secondary" style={{position: 'fixed', bottom: 32, right: 32}}>
                    <PlaylistAdd/>
                </Button>
                }
            </div>
        );
    }
}


export default withStyles(styles)(Home);
