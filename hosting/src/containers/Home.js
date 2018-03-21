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
import UploadDialog from "../components/dialogs/UploadDialog";

const styles = {
    root: {
        height: '100%'
    },
    flex: {
        flex: 1
    },

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
        bandAnchorEl: null,
        uploadAnchorEl: null,
        uploadSheetsDialogOpen: false,
        message: null,
        windowSize: null
    };

    componentWillMount() {
        this.setState({windowSize: window.innerWidth < 800 ? 'mobile' : 'desktop'});

        window.onresize = event => {
            if (event.target.innerWidth < 780 && this.state.windowSize === 'desktop') {
                this.setState({windowSize: 'mobile'});
            }

            if (event.target.innerWidth > 780 && this.state.windowSize === 'mobile') {
                this.setState({windowSize: 'desktop'});
            }
        };
    }

    _onAddFullScore = async (score, parts, pdf) => {
        const {band} = this.props;

        let scoreRef;
        if (score.id) {
            scoreRef = firebase.firestore().doc(`bands/${band.id}/scores/${score.id}`);
        } else {
            scoreRef = await firebase.firestore().collection(`bands/${band.id}/scores`).add({
                title: score.title || 'Untitled Score',
                composer: score.composer || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            })
        }

        const partsSnapshot = await scoreRef.collection('parts').get();
        await Promise.all(partsSnapshot.docs.map(doc => doc.ref.delete()));

        await Promise.all(
            parts.map(part => scoreRef.collection('parts').add({
                pages: part.pages,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                instrumentRef: firebase.firestore().doc(`instruments/${part.instrumentId}`),
                instrumentNumber: part.instrumentNumber
            })
        ));

        await firebase.firestore().doc(`bands/${band.id}/pdfs/${pdf.id}`).delete();

        this.setState({message: 'Score added'});
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.setState({message: null});
    };

    _onAddParts = async (score, parts) => {
        const {band} = this.props;

        let scoreRef;
        if (score.id) {
            scoreRef = firebase.firestore().doc(`bands/${band.id}/scores/${score.id}`);
        } else {
            scoreRef = await firebase.firestore().collection(`bands/${band.id}/scores`).add({
                title: score.title || 'Untitled Score',
                composer: score.composer || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
        }

        for (let part of parts) {
            const pdfDoc = await firebase.firestore().doc(`bands/${band.id}/pdfs/${part.pdfId}`).get();

            await scoreRef.collection('parts').add({
                pages: pdfDoc.data().pages,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                instrumentRef: firebase.firestore().doc(`instruments/${part.instrumentId}`),
                instrumentNumber: part.instrumentNumber
            });

            await pdfDoc.ref.delete();
        }

        this.setState({message: 'Parts added'});
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.setState({message: null});
    };

    _onBandClick = e => {
        this.setState({bandAnchorEl: e.currentTarget})
    };

    _onCreateBand = async () => {
        this.setState({bandAnchorEl: null});

        const {name} = await this.createDialog.open();

        const {user} = this.props;

        try {
            const instrumentRefs = (await firebase.firestore().collection('instruments').get()).docs.map(doc => doc.ref);

            let bandRef = await firebase.firestore().collection('bands').add({
                name: name,
                creatorRef: firebase.firestore().doc(`users/${user.id}`),
                code: Math.random().toString(36).substring(2, 7),
                instrumentRefs: instrumentRefs,
            });

            await firebase.firestore().doc(`users/${user.id}`).update({
                defaultBandRef: bandRef,
                bandRefs: [...user.bandRefs, bandRef],
            });
        } catch (err) {
            console.log(err);
        }
    };

    _onJoinBand = async () => {
        this.setState({bandAnchorEl: null});

        const {code} = await this.joinDialog.open();

        const {user, band} = this.props;

        let bandSnapshot = await firebase.firestore().collection('bands').where('code', '==', code).get();

        if (bandSnapshot.docs.length > 0) {
            let bandRef = firebase.firestore().doc(`bands/${bandSnapshot.docs[0].id}`);

            let userBandSnapshot = user.bandRefs.find(ref => ref.id === bandRef.id).get();

            if (userBandSnapshot.docs.length > 0) {
                this.setState({message: 'Band already joined!'});
            } else {
                await bandRef.update({members: [...band.members, firebase.firestore().doc(`users/${user.id}`)]});

                await firebase.firestore().doc(`users/${user.id}`).update({
                    defaultBandRef: bandRef,
                    bandRefs: [...user.bandRefs, bandRef]
                })
            }
        } else {
            this.setState({message: 'Band does not exist!'});
        }

        await new Promise(resolve => setTimeout(resolve, 3000));

        this.setState({message: null})
    };

    _onBandSelect = async bandId => {
        this.setState({bandAnchorEl: null});
        await firebase.firestore().doc(`users/${this.props.user.id}`).update({
            defaultBandRef: firebase.firestore().doc(`bands/${bandId}`)
        });
    };

    _onCreateSetlist = async () => {
        const {user, band} = this.props;

        const {title, date} = await this.setlistDialog.open();

        try {
            let setlistRef = await firebase.firestore().collection(`bands/${band.id}/setlists`).add({
                title: title,
                date: date,
                creatorRef: firebase.firestore().doc(`users/${user.id}`)
            });

            window.location.hash = `#/setlist/${band.id}${setlistRef.id}`;
        } catch (err) {
            console.log(err);
        }
    };

    _onNavClick = nameShort => {
        window.location.hash = `/${nameShort}`;
    };

    _onFileUploadButtonClick = e => {
        this.setState({uploadAnchorEl: e.currentTarget});
    };

    _onUploadMenuClick = async type => {
        const {files, path, accessToken} = await this.uploadDialog.open(type);

        const {band} = this.props;

        console.log(files);

        this.setState({uploadAnchorEl: null});

        switch (type) {
            case 'computer':
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    this.setState({message: `Uploading file ${i + 1}/${files.length}`});
                    await firebase.storage().ref(`bands/${this.props.band.id}/input/${file.name}`).put(file);
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

    render() {
        const {bandAnchorEl, uploadAnchorEl, message, windowSize} = this.state;

        const {classes, user, band, page} = this.props;

        return <div className={classes.root}>
            <AppBar style={{zIndex: 10}}>
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
                            user.bands && user.bands.map((band, index) =>
                                <MenuItem style={{height: 15}} key={index}
                                          onClick={() => this._onBandSelect(band.id)}>
                                    {band.name}
                                </MenuItem>
                            )
                        }
                    </Menu>
                    <SearchBar band={band}/>
                    <div style={{flex: 1}}/>
                    <IconButton style={{marginLeft: 10}} color="inherit" onClick={this._onFileUploadButtonClick}>
                        <FileUpload/>
                    </IconButton>
                    <Menu
                        anchorEl={uploadAnchorEl}
                        open={Boolean(uploadAnchorEl)}
                        onClose={this._onMenuClose}
                    >
                        <MenuItem onClick={() => this._onUploadMenuClick('computer')}>Choose from computer</MenuItem>
                        <MenuItem onClick={() => this._onUploadMenuClick('dropbox')}>Choose from Dropbox</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <div style={{display: 'flex', paddingTop: 64, height: '100%', overflow: 'hidden', boxSizing: 'border-box'}}>
                {
                    windowSize === 'desktop' &&
                    <div style={{
                        width: 220,
                        paddingTop: 16,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        boxSizing: 'border-box'
                    }}>
                        <List>
                            {[['Scores', 'scores'], ['Setlists', 'setlists'], ['Members', 'members'], ['Unsorted PDFs', 'pdfs']].map(([name, nameShort]) => {
                                const selected = nameShort === page;
                                const color = selected ? '#448AFF' : '#757575';
                                return <ListItem style={{paddingLeft: 24}} key={name} button onClick={() => this._onNavClick(nameShort)}>
                                    {nameShort === 'scores' && <LibraryMusic style={{color: color}}/>}
                                    {nameShort === 'setlists' && <QueueMusic style={{color: color}}/>}
                                    {nameShort === 'members' && <SupervisorAccount style={{color: color}}/>}
                                    {nameShort === 'pdfs' && <LibraryBooks style={{color: color}}/>}
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
                }
                <div style={{flex: 1, height: '100%', overflowY: 'auto'}}>
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
                        />
                    }
                </div>
            </div>
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
            />
        </div>
    }
}


export default withStyles(styles)(Home);