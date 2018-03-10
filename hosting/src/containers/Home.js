import React from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {
    Avatar, Button, Card, CardContent, CardMedia, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Paper,
    Snackbar,
    Tab,
    Tabs,
} from "material-ui";

import firebase from 'firebase';
import CreateSetlistDialog from "../components/dialogs/CreateSetlistDialog";
import UnsortedPDFs from "./Home/UnsortedPDFs";

import {
    Description, FileUpload, LibraryAdd, LibraryBooks, LibraryMusic, PlaylistAdd, QueueMusic,
    SupervisorAccount
} from "material-ui-icons";
import AddPartsDialog from "../components/dialogs/AddPartDialog";
import AddCompleteScoreDialog from "../components/dialogs/AddFullScoreDialog";

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
    }
};

class Home extends React.Component {
    state = {
        anchorEl: null,
        selectedPage: 3,
        band: {},
        uploadSheetsDialogOpen: false,
        message: null
    };

    unsubscribeCallbacks = [];


    componentWillReceiveProps(nextProps) {
        if (this.props.user.defaultBand !== nextProps.user.defaultBand) {
            for (const cb of this.unsubscribeCallbacks) {
                cb();
            }

            const band = nextProps.user.defaultBand;

            this.unsubscribeCallbacks.push(
                band.onSnapshot(snapshot => {
                    this.setState({band: {...this.state.band, ...snapshot.data()}});
                })
            );

            this.unsubscribeCallbacks.push(
                band.collection('scores').onSnapshot(async snapshot => {
                    for (let change of snapshot.docChanges) {
                        switch (change.type) {
                            case 'added':
                                const scoreDoc = await change.doc.data().ref.get();

                                this.unsubscribeCallbacks.push(
                                    scoreDoc.ref.collection('sheetMusic').onSnapshot(async snapshot => {
                                        const sheetMusic = await Promise.all(
                                            snapshot.docs.map(async doc => {
                                                const instrumentRef = await doc.data().instrument.get();
                                                return {...doc.data(), id: doc.id, instrument: instrumentRef.data()}
                                            })
                                        );

                                        const scores = [...this.state.band.scores];

                                        scores.find(score => score.id === scoreDoc.id).sheetMusic = sheetMusic;

                                        this.setState({band: {...this.state.band, scores: scores}})
                                    })
                                );

                                const scores = [...(this.state.band.scores || []), {
                                    ...scoreDoc.data(),
                                    id: scoreDoc.id
                                }];

                                this.setState({band: {...this.state.band, scores: scores}});
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

                    this.setState({band: {...this.state.band, members: members}});
                })
            );


            this.unsubscribeCallbacks.push(
                band.collection('pdfs').onSnapshot(snapshot => {
                    const pdfs = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
                    const pdfsSorted = pdfs.sort((a, b) => a.name.localeCompare(b.name));
                    this.setState({band: {...this.state.band, pdfs: pdfsSorted}});
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
                    this.setState({band: {...this.state.band, instruments: instrumentsSorted}});
                })
            );
        }
    }

    componentWillUnmount() {
        this.unsubscribeCallbacks.forEach(c => c());
    }

    _onAddButtonClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }

    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    _onMenuButtonClick() {

    }

    // _onAddScore = async () => {
    //     let uid = this.props.user.uid;
    //     let bandId = this.props.detail;
    //
    //     const {title, composer} = await this.scoreDialog.open();
    //
    //     try {
    //         const score = {
    //             title: title,
    //             composer: composer,
    //             creator: firebase.firestore().doc(`users/${uid}`),
    //             band: firebase.firestore().doc(`bands/${bandId}`)
    //         };
    //
    //         let ref = await firebase.firestore().collection('scores').add(score);
    //
    //         await firebase.firestore().collection(`bands/${bandId}/scores`).add({
    //             ref: firebase.firestore().doc(`scores/${ref.id}`)
    //         });
    //         // window.location.hash = `#/score/${ref.id}`;
    //     } catch (err) {
    //         console.log(err);
    //     }
    // }

    _onAddScore = async (score, instruments) => {
        let scoreRef;
        if (score.id) {
            scoreRef = firebase.firestore().doc(`scores/${score.id}`);
        } else {
            scoreRef = await firebase.firestore().collection('scores').add({
                title: score.title,
                composer: score.composer || ''
            });

            await firebase.firestore().collection(`bands/${this.props.detail}/scores`).add({
                ref: scoreRef
            })
        }

        for (let instrument of instruments) {
            await scoreRef.collection('sheetMusic').add({
                pagesCropped: instrument.pagesCropped,
                pagesOriginal: instrument.pagesOriginal,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                instrument: firebase.firestore().doc(`instruments/${instrument.instrumentId}`)
            });
        }
    };

    _onAddInstrument = async (scoreId) => {
        try {
            let {instrument, instrumentNumber} = await this.addInstrumentDialog.open();

            await firebase.firestore().collection(`scores/${scoreId}/sheetMusic`).add({
                instrument: firebase.firestore().doc(`instruments/${instrument.id}`),
                instrumentNumber
            })
        } catch (err) {
            console.log(err);
        }
    };

    _onNavClick = index => {
        this.setState({selectedPage: index});
    };

    _onUploadSheets = async (scoreId, sheetMusicId, sheetImages) => {
        const sheetMusicRef = firebase.firestore().doc(`scores/${scoreId}/sheetMusic/${sheetMusicId}`);

        await sheetMusicRef.update({uploading: true});

        const taskSnapshots = await Promise.all(
            sheetImages.map((image, index) =>
                firebase.storage().ref(`sheets/${scoreId}/${sheetMusicId}/${index}`).putString(image, 'data_url', {contentType: 'image/png'}))
        );

        await sheetMusicRef.update({
            uploading: firebase.firestore.FieldValue.delete(),
            sheets: taskSnapshots.map(snap => snap.downloadURL)
        });
    };

    _onAddPDF = async (score, instruments) => {
        let scoreRef;
        if (score.id) {
            scoreRef = firebase.firestore().doc(`scores/${score.id}`);
        } else {
            scoreRef = await firebase.firestore().collection('scores').add({
                title: score.title,
                composer: score.composer || ''
            });

            await firebase.firestore().collection(`bands/${this.props.detail}/scores`).add({
                ref: scoreRef
            })
        }

        for (let instrument of instruments) {
            const pdfDocRef = firebase.firestore().doc(`bands/${this.props.detail}/pdfs/${instrument.pdfId}`);

            const doc = await pdfDocRef.get();

            await scoreRef.collection('sheetMusic').add({
                pagesCropped: doc.data().pagesCropped,
                pagesOriginal: doc.data().pagesOriginal,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                instrument: firebase.firestore().doc(`instruments/${instrument.instrumentId}`)
            });
        }
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

    _onSheetsChange = async (scoreId, sheetMusicId, sheets) => {
        const sheetMusicRef = firebase.firestore().doc(`scores/${scoreId}/sheetMusic/${sheetMusicId}`);
        await sheetMusicRef.update({sheets: sheets});
    };

    render() {
        const {anchorEl, selectedPage, band, uploadSheetsDialogOpen, message} = this.state;

        const {classes, user} = this.props;


        return (
            <div className={classes.root}>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <Typography style={{marginLeft: 50}} variant="title" color="inherit" className={classes.flex}>
                            {band.name}
                        </Typography>
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
                            onAddScore={this._onAddScore}
                            onAddInstrument={this._onAddInstrument}
                            onUploadSheets={this._onUploadSheets}
                            onSheetsChange={this._onSheetsChange}
                            onAddPDF={this._onAddPDF}
                        />
                        }
                    </div>
                </div>
                <CreateSetlistDialog onRef={ref => this.setlistDialog = ref}/>
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
