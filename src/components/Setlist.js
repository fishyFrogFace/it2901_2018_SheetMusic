import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

const styles = {
    root: {
    }
};

class Setlist extends Component {
    componentWillReceiveProps(props) {

    }

    render() {
        const {classes, user} = this.props;
        console.log(user);

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="title" color="inherit">
                            Setlist
                        </Typography>
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
})), withStyles(styles))(Setlist);