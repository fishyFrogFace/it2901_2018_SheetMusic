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

class Band extends Component {
    componentWillReceiveProps(props) {
    }

    render() {
        const {classes, user, arrangements} = this.props;
        console.log(user, arrangements);

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
                    {(arrangements || []).map(arr =>
                        <a key={arr.id} href={`/band/${arr.id}`}>
                            {arr.name}
                        </a>
                    )}
                </div>
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.default.user
})), withStyles(styles))(Band);