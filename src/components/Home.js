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

class Home extends Component {
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
        console.log(user, bands);

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
                        <a key={band.id} href={`/band/${band.id}`}>
                            {band.name}
                        </a>
                    )}
                </div>
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.default.user,
    bands: state.default.bands
}), {signIn, getBands}), withStyles(styles))(Home);