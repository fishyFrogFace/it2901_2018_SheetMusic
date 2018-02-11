import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {push} from 'react-router-redux';

import {signIn, getBands} from '../actions';

const styles = {
    root: {
        background: '#f9f9f9',
    }
};

class Home extends Component {
    constructor(props) {
        super(props);
        props.dispatch(signIn());
    }

    componentWillReceiveProps(props) {
        if (!this.props.user && 'user' in props) {
            this.props.dispatch(getBands(props.user));
        }
    }

    render() {
        const {classes, bands} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="title" color="inherit">
                            ScoreButler
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div>
                    {(bands || []).map(band =>
                        <div key={band.id} onClick={() => this.props.dispatch(push(`/band/${band.id}`))}>
                            {band.name}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default compose(connect(state => ({
    user: state.default.user,
    bands: state.default.bands
})), withStyles(styles))(Home);