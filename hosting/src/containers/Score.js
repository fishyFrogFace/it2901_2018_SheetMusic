import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {IconButton, Menu, MenuItem, Select, Snackbar} from "material-ui";
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import MoreVertIcon from 'material-ui-icons/MoreVert';

import firebase from 'firebase';
import 'firebase/storage';

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
        selectedPartId: null,
        anchorEl: null,
        score: {}
    };

    async componentWillMount() {
        const scoreId = this.props.detail;

        this.unsubscribe = firebase.firestore().collection(`scores/${scoreId}/parts`).onSnapshot(async snapshot => {
            const parts = await Promise.all(
                snapshot.docs.map(async doc => ({
                    ...doc.data(),
                    id: doc.id,
                    instrument: (await doc.data().instrument.get()).data()
                }))
            );

            const partsSorted = parts
                .sort((a, b) => `${a.instrument.name} ${a.instrumentNumber}`.localeCompare(`${b.instrument.name} ${b.instrumentNumber}`));

            this.setState({
                score: {...this.state.score, parts: partsSorted},
                selectedPartId: partsSorted.length > 0 ? partsSorted[0].id : null
            });
        });

        // Score

        const scoreDoc = await firebase.firestore().doc(`scores/${scoreId}`).get();
        const band = await scoreDoc.data().band.get();

        this.setState({
            score: {...this.state.score, ...scoreDoc.data(), band: {...band.data(), id: band.id}}
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    _onInstrumentSelectChange(e) {
        this.setState({selectedPartId: e.target.value});
    }

    async _onArrowBackButtonClick() {
        window.location.hash = `#/band/${this.state.score.band.id}`;
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
                    const {score, selectedPartId} = this.state;

                    const part = score.parts.find(part => part.id === selectedPartId);

                    const {} = await this.downloadDialog.open(part.instrument);

                    const jsPDF = await import('jspdf');

                    const dateString = new Date().toLocaleDateString();

                    const {width, height} = await new Promise(resolve => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.src = part.sheets[0];
                    });

                    const doc = new jsPDF('p', 'px', [width, height]);

                    for (let i = 0; i < part.sheets.length; i++) {
                        if (i > 0) {
                            doc.addPage();
                        }

                        const url = part.sheets[i];
                        const response = await fetch(url);
                        const blob = await response.blob();

                        const imageData = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });

                        doc.addImage(imageData, 'PNG', 0, 0, width, height);
                        doc.text(`${score.band.name}     ${dateString}     ${score.title}     Downloaded by: ${this.props.user.displayName}     Page: ${i + 1}/${part.sheets.length}`, 20, height - 20);
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
        const {selectedPartId, anchorEl, score, message} = this.state;

        const hasParts = Boolean(score.parts && score.parts.length);

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
                            hasParts &&
                            <Select
                                className={classes.instrumentSelector}
                                classes={{
                                    select: classes.instrumentSelector__select,
                                    icon: classes.instrumentSelector__icon
                                }}
                                value={selectedPartId}
                                onChange={e => this._onInstrumentSelectChange(e)}
                                disableUnderline={true}
                            >
                                {
                                    score.parts.map((part, index) =>
                                        <MenuItem key={index} value={part.id}>{part.instrument.name} {part.instrumentNumber > 0 ? part.instrumentNumber : ''}</MenuItem>
                                    )
                                }
                            </Select>
                        }
                        <div className={classes.flex}></div>
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
                        hasParts &&
                        (score.parts.find(s => s.id === selectedPartId).sheets || []).map((sheet, index) =>
                            <img key={index} className={classes.sheet} src={sheet}/>
                        )
                    }
                </div>
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