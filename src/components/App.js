import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {signIn} from '../actions';

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

    render() {
        const {classes, user} = this.props;

        console.log(user);

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="title" color="inherit">
                            ScoreButler
                        </Typography>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default compose(connect(state => ({user: state.user}), {signIn}), withStyles(styles))(App);