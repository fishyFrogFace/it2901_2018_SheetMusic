import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {getArrangementDetail} from "../actions";
import {MenuItem, Select} from "material-ui";

const styles = {
    root: {},

    instrumentSelector: {
        marginLeft: 25,
    },

    instrumentSelector__select: {color: 'white'},
    instrumentSelector__icon: {fill: 'white'}
};


class Arrangement extends Component {
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
        console.log(e);
    }

    render() {
        const {classes, arrangement = {}} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
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
                    </Toolbar>
                </AppBar>
                <div>
                </div>
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.default.user,
    arrangement: state.default.arrangement,
    pathname: state.router.location.pathname
})), withStyles(styles))(Arrangement);