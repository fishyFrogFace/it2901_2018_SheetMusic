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
import FileUploader from "../components/FileUploader";

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
    }

};

export const getArrangementDetail = arrId => async dispatch => {
    let doc = await firebase.firestore().doc(`arrangements/${arrId}`).get();
    dispatch({type: 'ARRANGEMENT_FETCH_RESPONSE', arrangement: {id: doc.id, ...doc.data()}})
};


class Arrangement extends Component {
    state = {
        fileUploaderOpen: false
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

    }

    _onArrowBackButtonClick() {

    }

    _onFileUploadButtonClick() {
        this.setState({fileUploaderOpen: true});
    }

    _onFileUploaderClose() {
        this.setState({fileUploaderOpen: false});
    }

    _onFileUploaderUpload(e) {
        this.setState({fileUploaderOpen: false});
    }

    render() {
        const {classes, arrangement = {}} = this.props;

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
                        <Select
                            className={classes.instrumentSelector}
                            classes={{
                                select: classes.instrumentSelector__select,
                                icon: classes.instrumentSelector__icon
                            }}
                            value={0}
                            onChange={e => this._onInstrumentSelectChange(e)}
                            inputProps={{
                                name: 'age',
                                id: 'age-simple',
                            }}
                            disableUnderline={true}
                        >
                            <MenuItem value={0}>Instrument1</MenuItem>
                            <MenuItem value={1}>Instrument2</MenuItem>
                            <MenuItem value={2}>Instrument3</MenuItem>
                            <MenuItem value={2}>Instrument4</MenuItem>
                            <MenuItem value={2}>Instrument5</MenuItem>
                            <MenuItem value={2}>Instrument6</MenuItem>
                            <MenuItem value={2}>Instrument7</MenuItem>
                        </Select>
                        <div className={classes.flex}></div>
                        <IconButton color="inherit" onClick={() => this._onFileUploadButtonClick()}>
                            <FileUploadIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <FileUploader
                    open={this.state.fileUploaderOpen}
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