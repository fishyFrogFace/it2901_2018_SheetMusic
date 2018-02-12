import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {getArrangementDetail} from "../actions";

const styles = {
    root: {
    }
};


class Arrangement extends Component {
    requestArrangementDetail() {
        const arrId = this.props.pathname.split('/')[2];
        this.props.dispatch(getArrangementDetail(arrId));
    }

    componentWillMount() {
        if (this.props.user && !this.props.arrangement) {
            this.requestArrangementDetail();
        }
    }

    componentWillReceiveProps(props) {
        if (props.user && !props.arrangement) {
            this.requestArrangementDetail();
        }
    }

    render() {
        const {classes, arrangement={}} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="title" color="inherit">
                            Arrangement
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div>
                    <div>{arrangement.title}</div>
                    <div>{arrangement.composer}</div>
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