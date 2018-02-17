import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {IconButton, MenuItem, Select} from "material-ui";
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import FileUploadIcon from 'material-ui-icons/FileUpload';

import firebase from 'firebase';
import 'firebase/storage';

import FileUploader from "../components/FileUploader";

const addInstruments = (arrId, instruments) => async dispatch => {
    const instrumentCollectionRef = firebase.firestore().collection(`arrangements/${arrId}/instruments`);

    for (let instrument of instruments) {
        let docRef = firebase.firestore().doc(`instruments/${instrument.id}`);
        let querySnapshot = await instrumentCollectionRef.where('instrument', '==', docRef).get();

        const tasks = Promise.all(
            instrument.sheets.map((sheet, index) =>
                firebase.storage().ref(`sheets/${arrId}/${instrument.id}/${index}`).putString(sheet, 'data_url', {contentType: 'image/png'}))
        );

        if (querySnapshot.docs.length > 0) {
            // TODO create dialog asking whether to overwrite or not
            const taskSnapshots = await tasks;
            await querySnapshot.docs[0].ref.update({sheets: taskSnapshots.map(snap => snap.downloadURL)})
        } else {
            const taskSnapshots = await tasks;
            await instrumentCollectionRef.add({instrument: docRef, sheets: taskSnapshots.map(snap => snap.downloadURL)})
        }
    }

    dispatch({type: 'INSTRUMENTS_ADD_SUCCESS'});
};


export const getArrangementDetail = arrId => async dispatch => {
    const doc = await firebase.firestore().doc(`arrangements/${arrId}`).get();
    dispatch({type: 'ARRANGEMENT_DETAIL_FETCH_RESPONSE', arrangement: {id: doc.id, ...doc.data()}});

    const snapshot = await firebase.firestore().collection(`arrangements/${arrId}/instruments`).get();

    const instruments = await Promise.all(
        snapshot.docs.map(async doc => ({
            ...doc.data(),
            instrumentName: (await doc.data().instrument.get()).data().name
        }))
    );

    dispatch({type: 'ARRANGEMENT_INSTRUMENTS_FETCH_RESPONSE', instruments: instruments});
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
        selectedInstrument: 0
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

    render() {
        const {classes, arrangement = {instruments: []}} = this.props;
        const {selectedInstrument, fileUploaderOpen} = this.state;

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
                                    {arrangement.instruments.map((instrument, index) => <MenuItem key={index}
                                                                                                  value={index}>{instrument.instrumentName}</MenuItem>)}
                                </Select> : ''
                        }
                        <div className={classes.flex}></div>
                        <IconButton color="inherit" onClick={() => this._onFileUploadButtonClick()}>
                            <FileUploadIcon/>
                        </IconButton>
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
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.default.user,
    arrangement: state.default.arrangement,
    pathname: state.router.location.pathname
})), withStyles(styles))(Arrangement);