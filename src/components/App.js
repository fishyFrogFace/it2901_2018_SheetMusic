import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {signIn, getBands} from '../actions';

const styles = {
    root: {
        background: '#f9f9f9',
    }
};

class App extends Component {
    constructor(props) {
        super(props);
        props.signIn();
    }

    componentWillReceiveProps(props) {
        if (!this.props.user && 'user' in props) {
            this.props.getBands(props.user);
        }
    }

    render() {
        const {classes, user, bands} = this.props;
        console.log(bands);

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
                    {(bands || []).map(band => band.name)}
                </div>
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.user,
    bands: state.bands
}), {signIn, getBands}), withStyles(styles))(App);