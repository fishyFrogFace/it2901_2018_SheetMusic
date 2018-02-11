import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {push} from 'react-router-redux';

import {getArrangements} from "../actions";

const styles = {
    root: {
    }
};

class Band extends Component {
    componentWillMount() {
        this.props.dispatch(getArrangements());
    }

    render() {
        const {classes, arrangements=[]} = this.props;
        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="title" color="inherit">
                            Band
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div>
                    {arrangements.map(arr =>
                        <div key={arr.id} onClick={() => this.props.dispatch(push(`/arrangement/${arr.id}`))}>
                            <div>{arr.title}</div>
                            <div>{arr.composer}</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.default.user,
    arrangements: state.default.arrangements
})), withStyles(styles))(Band);

