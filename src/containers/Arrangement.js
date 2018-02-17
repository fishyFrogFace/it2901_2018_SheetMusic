import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
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

import FileUploader from "../components/FileUploader";
import FormDialog from "../components/FormDialog";
import SelectDialog from "../components/dialogs/SelectDialog";

const addInstruments = (arrId, instruments) => async dispatch => {
    const instrumentCollectionRef = firebase.firestore().collection(`arrangements/${arrId}/instruments`);

    dispatch({type: 'MESSAGE_SHOW', message: 'Starting upload...'});


    for (let i = 0; i < instruments.length; i++) {
        let instrument = instruments[i];

        let docRef = firebase.firestore().doc(`instruments/${instrument.id}`);
        let querySnapshot = await instrumentCollectionRef.where('instrument', '==', docRef).get();

        const tasks = Promise.all(
            instrument.sheets.map((sheet, index) =>
                firebase.storage().ref(`sheets/${arrId}/${instrument.id}/${index}`).putString(sheet, 'data_url', {contentType: 'image/png'}))
        );

        dispatch({type: 'MESSAGE_SHOW', message: `Uploading instrument ${i + 1}/${instruments.length}...`});

        if (querySnapshot.docs.length > 0) {
            // TODO create dialog asking whether to overwrite or not
            const taskSnapshots = await tasks;
            await querySnapshot.docs[0].ref.update({sheets: taskSnapshots.map(snap => snap.downloadURL)})
        } else {
            const taskSnapshots = await tasks;
            await instrumentCollectionRef.add({instrument: docRef, sheets: taskSnapshots.map(snap => snap.downloadURL)})
        }
    }

    dispatch({type: 'MESSAGE_SHOW', message: 'Loading instruments...'});

    dispatch(getArrangementDetail(arrId));
};


export const getArrangementDetail = arrId => async dispatch => {
    const doc = await firebase.firestore().doc(`arrangements/${arrId}`).get();
    dispatch({
        type: 'ARRANGEMENT_DETAIL_FETCH_RESPONSE',
        arrangement: {id: doc.id, ...doc.data()}
    });

    const snapshot = await firebase.firestore().collection(`arrangements/${arrId}/instruments`).get();

    const instruments = await Promise.all(
        snapshot.docs.map(async doc => ({
            ...doc.data(),
            name: (await doc.data().instrument.get()).data().name
        }))
    );

    dispatch({type: 'ARRANGEMENT_INSTRUMENTS_FETCH_RESPONSE', instruments: instruments});
    dispatch({type: 'MESSAGE_HIDE'});
};

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

class Arrangement extends Component {
    state = {
        fileUploaderOpen: false,
        selectedInstrument: 0,
        anchorEl: null
    };

    requestArrangementDetail() {
        const arrId = this.props.pathname.split('/')[2];
        this.props.dispatch(getArrangementDetail(arrId));
    }

    componentWillMount() {
        if (this.props.user) {
            this.requestArrangementDetail();
        }
    }

    componentWillReceiveProps(props) {
        if (!this.props.user && props.user) {
            this.requestArrangementDetail();
        }
    }

    _onInstrumentSelectChange(e) {
        this.setState({selectedInstrument: e.target.value});
    }

    _onArrowBackButtonClick() {

    }

    _onFileUploadButtonClick() {
        this.setState({fileUploaderOpen: true});
    }

    _onFileUploaderClose() {
        this.setState({fileUploaderOpen: false});
    }

    _onFileUploaderUpload(instruments) {
        const arrId = this.props.pathname.split('/')[2];
        this.props.dispatch(addInstruments(arrId, instruments));
        this.setState({fileUploaderOpen: false});
    }

    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    _onMoreVertClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }

    async _onMenuClick(type) {
        switch (type) {
            case 'download':
                const instrument = await this.instrumentDialog.open();
                break;
        }

        this.setState({anchorEl: null});
    }

    render() {
        const {classes, arrangement = {instruments: []}, message} = this.props;
        const {selectedInstrument, fileUploaderOpen, anchorEl} = this.state;

        const hasInstruments = Boolean(arrangement.instruments.length);

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton color="inherit" onClick={() => this._onArrowBackButtonClick()}>
                            <ArrowBackIcon/>
                        </IconButton>
                        <Typography variant="title" color="inherit">
                            {arrangement.title}
                        </Typography>
                        {
                            hasInstruments ?
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
                                        arrangement.instruments.map((instrument, index) =>
                                            <MenuItem key={index} value={index}>{instrument.name}</MenuItem>
                                        )
                                    }
                                </Select> : ''
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
                        hasInstruments ?
                            arrangement.instruments[selectedInstrument].sheets.map((sheet, index) =>
                                <img key={index} className={classes.sheet} src={sheet}/>
                            ) : ''
                    }
                </div>
                <FileUploader
                    open={fileUploaderOpen}
                    onClose={() => this._onFileUploaderClose()}
                    onUpload={e => this._onFileUploaderUpload(e)}
                />
                <Snackbar
                    anchorOrigin={{vertical: 'bottom', horizontal: 'right',}}
                    open={Boolean(message)}
                    message={message}
                />
                <SelectDialog
                    items={arrangement.instruments}
                    confirmText='Download'
                    title='Download Instrument'
                    onRef={ref => this.instrumentDialog = ref}
                />
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.default.user,
    arrangement: state.default.arrangement,
    message: state.default.message,
    pathname: state.router.location.pathname
})), withStyles(styles))(Arrangement);