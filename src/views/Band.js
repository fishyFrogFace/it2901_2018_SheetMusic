import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {push} from 'react-router-redux';

import {getArrangements, addArrangement} from "../actions";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem,
    TextField
} from "material-ui";
import AddIcon from 'material-ui-icons/Add';

const styles = {
    root: {
    },
    flex: {
        flex: 1
    },

    dialogContent: {
        display: 'flex',
        flexDirection: 'column'
    }
};

class Band extends Component {
    state = {
        anchorEl: null,
        arrangementDialogOpen: false,
        setlistDialogOpen: false,
        arrangementTitle: '',
        arrangementComposer: '',
        setlistName: ''
    };

    componentWillMount() {
        this.props.dispatch(getArrangements());
    }

    _onAddButtonClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }

    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    _onMenuClick(type) {
        this.setState({[`${type}DialogOpen`]: true});
        this.setState({anchorEl: null});
    }

    _onDialogClose(type) {
        this.setState({[`${type}DialogOpen`]: false});
    }

    _onDialogSubmit(type) {
        switch (type) {
            case 'arrangement':
                this.props.dispatch(addArrangement(this.state.arrangementTitle, this.state.arrangementComposer));
                break;
            case 'setlist':
                // this.props.dispatch(joinBand(this.state.bandCode));
                break;
            default:
                break;
        }

        this.setState({[`${type}DialogOpen`]: false});
    }

    render() {
        const {anchorEl, arrangementDialogOpen} = this.state;
        const {classes, arrangements=[]} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            Band
                        </Typography>
                        <IconButton color="inherit" aria-label="Menu" onClick={e => this._onAddButtonClick(e)}>
                            <AddIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => this._onMenuClose()}
                        >
                            <MenuItem onClick={() => this._onMenuClick('arrangement')}>Create Arrangement</MenuItem>
                            <MenuItem onClick={() => this._onMenuClick('setlist')}>Create Setlist</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <div>
                    {arrangements.map((arr, index) =>
                        <div key={index} onClick={() => this.props.dispatch(push(`/arrangement/${arr.id}`))}>
                            <div>{arr.title}</div>
                            <div>{arr.composer}</div>
                        </div>
                    )}
                </div>
                <Dialog open={arrangementDialogOpen} onClose={() => this._onDialogClose('arrangement')}>
                    <DialogTitle>Create Band</DialogTitle>
                    <DialogContent className={classes.dialogContent}>
                        <TextField
                            label="Title"
                            margin="normal"
                            onChange={e => this.setState({arrangementTitle: e.target.value})}
                        />
                        <TextField
                            label="Composer"
                            margin="normal"
                            onChange={e => this.setState({arrangementComposer: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => this._onDialogClose('arrangement')}>Cancel</Button>
                        <Button color="primary" onClick={() => this._onDialogSubmit('arrangement')} autoFocus>Create</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.default.user,
    arrangements: state.default.arrangements
})), withStyles(styles))(Band);

