import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {IconButton, Menu, MenuItem, Select, Snackbar} from "material-ui";
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import FileUploadIcon from 'material-ui-icons/FileUpload';
import MoreVertIcon  from 'material-ui-icons/MoreVert';

import firebase from 'firebase';
import 'firebase/storage';

import UploadSheetsDialog from "../components/dialogs/UploadSheetsDialog";
import DownloadSheetsDialog from "../components/dialogs/DownloadSheetsDialog";

const styles = {
    root: {},

    instrumentSelector: {
        marginLeft: 25
    },

    instrumentSelector__select: {
        color: 'white'
    },
    instrumentSelector__icon: {
        fill: 'white'
    },

    flex: {
        flex: 1
    },

    sheetContainer: {
    },

    sheet: {
        width: '100%'
    }
};

class Score extends Component {
    state = {
        fileUploaderOpen: false,
        selectedInstrument: 0,
        anchorEl: null,
        score: {}
    };

    componentWillMount() {
        const scoreId = this.props.detail;

        firebase.firestore().doc(`scores/${scoreId}`).get().then(doc => {
            this.setState({score: doc.data()});
        });

        this.unsubscribe = firebase.firestore().collection(`scores/${scoreId}/instruments`).onSnapshot(async snapshot => {
            const instruments = await Promise.all(
                snapshot.docs.map(async doc => ({
                    ...doc.data(),
                    name: (await doc.data().instrument.get()).data().name
                }))
            );

            this.setState({score: {...this.state.score, instruments: instruments}});
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    _onInstrumentSelectChange(e) {
        this.setState({selectedInstrument: e.target.value});
    }

    async _onArrowBackButtonClick() {
        window.location.hash = `#/band/${(await this.state.score.band.get()).id}`;
    }

    async _onFileUploadButtonClick() {
        const instruments = await this.uploadDialog.open();

        const scoreId = this.props.detail;

        const instrumentCollectionRef = firebase.firestore().collection(`scores/${scoreId}/instruments`);

        this.setState({message: 'Starting upload...'});

        for (let i = 0; i < instruments.length; i++) {
            let instrument = instruments[i];

            let docRef = firebase.firestore().doc(`instruments/${instrument.id}`);
            let querySnapshot = await instrumentCollectionRef.where('instrument', '==', docRef).get();

            const tasks = Promise.all(
                instrument.sheets.map((sheet, index) =>
                    firebase.storage().ref(`sheets/${scoreId}/${instrument.id}/${index}`).putString(sheet, 'data_url', {contentType: 'image/png'}))
            );

            this.setState({message: `Uploading instrument ${i + 1}/${instruments.length}...`});

            if (querySnapshot.docs.length > 0) {
                // TODO create dialog asking whether to overwrite or not
                const taskSnapshots = await tasks;
                await querySnapshot.docs[0].ref.update({sheets: taskSnapshots.map(snap => snap.downloadURL)})
            } else {
                const taskSnapshots = await tasks;
                await instrumentCollectionRef.add({instrument: docRef, sheets: taskSnapshots.map(snap => snap.downloadURL)})
            }
        }
    }

    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    _onMoreVertClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }

    async _onMenuClick(type) {
        this.setState({anchorEl: null});

        switch (type) {
            case 'download':
                try {
                    const {instrument, number} = await this.downloadDialog.open();

                    const jsPDF = await import('jspdf');

                    const score = this.state.score;

                    const band = (await score.band.get()).data();

                    const dateString = new Date().toLocaleDateString();

                    const {width, height} = await new Promise(resolve => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.src = instrument.sheets[0];
                    });

                    const doc = new jsPDF('p', 'px', [width, height]);

                    for (let i = 0; i < instrument.sheets.length; i++) {
                        if (i > 0) {
                            doc.addPage();
                        }

                        const url = instrument.sheets[i];
                        const response = await fetch(url);
                        const blob = await response.blob();

                        const imageData = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });

                        doc.addImage(imageData, 'PNG', 0, 0, width, height);
                        doc.text(`${band.name}     ${dateString}     ${score.title}     Downloaded by: ${this.props.user.displayName}     Page: ${i + 1}/${instrument.sheets.length}`, 20, height - 20);
                    }

                    doc.save(`${score.title}.pdf`);
                } catch (err) {
                    console.log(err);
                    // Cancelled
                }

                break;
        }

    }

    render() {
        const {classes} = this.props;
        const {selectedInstrument, anchorEl, score, message} = this.state;

        const hasInstruments = Boolean(score.instruments && score.instruments.length);

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton color="inherit" onClick={() => this._onArrowBackButtonClick()}>
                            <ArrowBackIcon/>
                        </IconButton>
                        <Typography variant="title" color="inherit">
                            {score.title}
                        </Typography>
                        {
                            hasInstruments &&
                            <Select
                                className={classes.instrumentSelector}
                                classes={{
                                    select: classes.instrumentSelector__select,
                                    icon: classes.instrumentSelector__icon
                                }}
                                value={selectedInstrument}
                                onChange={e => this._onInstrumentSelectChange(e)}
                                disableUnderline={true}
                            >
                                {
                                    score.instruments.map((instrument, index) =>
                                        <MenuItem key={index} value={index}>{instrument.name}</MenuItem>
                                    )
                                }
                            </Select>
                        }
                        <div className={classes.flex}></div>
                        <IconButton color="inherit" onClick={() => this._onFileUploadButtonClick()}>
                            <FileUploadIcon/>
                        </IconButton>
                        <IconButton color="inherit" onClick={e => this._onMoreVertClick(e)}>
                            <MoreVertIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => this._onMenuClose()}
                        >
                            <MenuItem onClick={() => this._onMenuClick('download')}>Download Instrument</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <div className={classes.sheetContainer}>
                    {
                        hasInstruments &&
                        score.instruments[selectedInstrument].sheets.map((sheet, index) =>
                            <img key={index} className={classes.sheet} src={sheet}/>
                        )
                    }
                </div>
                <UploadSheetsDialog onRef={ref => this.uploadDialog = ref}/>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={Boolean(message)}
                    message={message}
                    autoHideDuration={3000}
                    onClose={() => this.setState({message: null})}
                />
                <DownloadSheetsDialog
                    instruments={score.instruments || []}
                    onRef={ref => this.downloadDialog = ref}
                />
            </div>
        );
    }
}


export default withStyles(styles)(Score);