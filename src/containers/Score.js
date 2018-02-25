import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {IconButton, Menu, MenuItem, Select, Snackbar} from "material-ui";
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import FileUploadIcon from 'material-ui-icons/FileUpload';
import MoreVertIcon from 'material-ui-icons/MoreVert';

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

    sheetContainer: {},

    sheet: {
        width: '100%'
    }
};

class Score extends Component {
    state = {
        fileUploaderOpen: false,
        selectedInstrument: null,
        anchorEl: null,
        score: {},
        instruments: []
    };

    async componentWillMount() {
        const scoreId = this.props.detail;

        this.unsubscribe = firebase.firestore().collection(`scores/${scoreId}/sheetMusic`).onSnapshot(async snapshot => {
            const sheetMusic = await Promise.all(
                snapshot.docs.map(async doc => ({
                    ...doc.data(),
                    id: doc.id,
                    instrument: (await doc.data().instrument.get()).data()
                }))
            );

            const sheetMusicSorted = sheetMusic
                .sort((a, b) => `${a.instrument.name} ${a.instrumentNumber}`.localeCompare(`${b.instrument.name} ${b.instrumentNumber}`));

            this.setState({
                score: {...this.state.score, sheetMusic: sheetMusicSorted},
                selectedInstrument: sheetMusicSorted.length > 0 ? sheetMusicSorted[0].id : null
            });
        });

        // Score

        const scoreDoc = await firebase.firestore().doc(`scores/${scoreId}`).get();
        const band = await scoreDoc.data().band.get();

        this.setState({
            score: {...this.state.score, ...scoreDoc.data(), band: {...band.data(), id: band.id}}
        });

        // Instruments

        const snapshot = await firebase.firestore().collection('instruments').get();

        const instrumentsSorted = snapshot.docs
            .map(doc => ({id: doc.id, ...doc.data()}))
            .sort((a, b) => a.name.localeCompare(b.name));

        this.setState({instruments: instrumentsSorted});
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    _onInstrumentSelectChange(e) {
        this.setState({selectedInstrument: e.target.value});
    }

    async _onArrowBackButtonClick() {
        window.location.hash = `#/band/${this.state.score.band.id}`;
    }

    async _onFileUploadButtonClick() {
        const sheetGroups = await this.uploadDialog.open();

        const scoreId = this.props.detail;

        const sheetMusicRef = firebase.firestore().collection(`scores/${scoreId}/sheetMusic`);

        this.setState({message: 'Starting upload...'});

        for (let i = 0; i < sheetGroups.length; i++) {
            let group = sheetGroups[i];

            let instrumentRef = firebase.firestore().doc(`instruments/${group.instrument.id}`);
            let querySnapshot = await sheetMusicRef
                .where('instrument', '==', instrumentRef)
                .where('instrumentNumber', '==', group.instrumentNumber)
                .get();

            const tasks = Promise.all(
                group.sheets.map((sheet, index) =>
                    firebase.storage().ref(`sheets/${scoreId}/${group.instrument.id}/${group.instrumentNumber}/${index}`).putString(sheet.image, 'data_url', {contentType: 'image/png'}))
            );

            this.setState({message: `Uploading instrument ${i + 1}/${sheetGroups.length}...`});

            if (querySnapshot.docs.length > 0) {
                // TODO create dialog asking whether to overwrite or not
                const taskSnapshots = await tasks;
                await querySnapshot.docs[0].ref.update({sheets: taskSnapshots.map(snap => snap.downloadURL)})
            } else {
                const taskSnapshots = await tasks;
                await sheetMusicRef.add({
                    instrument: instrumentRef,
                    instrumentNumber: group.instrumentNumber,
                    sheets: taskSnapshots.map(snap => snap.downloadURL),
                })
            }
        }

        this.setState({message: null});
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
                    const {} = await this.downloadDialog.open();

                    const jsPDF = await import('jspdf');

                    const {score, selectedInstrument} = this.state;

                    const instrument = score.sheetMusic.find(s => s.id === selectedInstrument);

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
        const {selectedInstrument, anchorEl, score, message, instruments} = this.state;

        const hasSheetMusic = Boolean(score.sheetMusic && score.sheetMusic.length);

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
                            hasSheetMusic &&
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
                                    score.sheetMusic.map((s, index) =>
                                        <MenuItem key={index} value={s.id}>{s.instrument.name} {s.instrumentNumber > 0 ? s.instrumentNumber : ''}</MenuItem>
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
                        hasSheetMusic &&
                        score.sheetMusic.find(s => s.id === selectedInstrument).sheets.map((sheet, index) =>
                            <img key={index} className={classes.sheet} src={sheet}/>
                        )
                    }
                </div>
                <UploadSheetsDialog instruments={instruments} onRef={ref => this.uploadDialog = ref}/>
                <DownloadSheetsDialog onRef={ref => this.downloadDialog = ref}/>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={Boolean(message)}
                    message={message}
                />
            </div>
        );
    }
}


export default withStyles(styles)(Score);