import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {push} from 'react-router-redux';

import {signIn, getBands, addBand} from '../actions';

import {
    Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem,
    TextField
} from "material-ui";
import AddIcon from 'material-ui-icons/Add';

const styles = {
    root: {
    },
    flex: {
        flex: 1
    },
    card: {
        width: 300,
        marginRight: 20,
        marginBottom: 20,
        cursor: 'pointer'
    },
    media: {
        height: 200,
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: 20
    }
};


class Home extends Component {
    state = {
        anchorEl: null,
        createDialogOpen: false,
        joinDialogOpen: false,
        bandName: '',
        bandCode: ''
    };

    constructor(props) {
        super(props);
        props.dispatch(signIn());
    }

    componentWillReceiveProps(props) {
        if (!this.props.user && 'user' in props) {
            this.props.dispatch(getBands(props.user));
        }
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
            case 'create':
                this.props.dispatch(addBand(this.state.bandName));
                break;
            case 'join':
                // this.props.dispatch(joinBand(this.state.bandCode));
                break;
            default:
                break;
        }

        this.setState({[`${type}DialogOpen`]: false});
    }

    render() {
        const {anchorEl, createDialogOpen, joinDialogOpen} = this.state;
        const {classes, bands = []} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            ScoreButler
                        </Typography>
                        <IconButton color="inherit" aria-label="Menu" onClick={e => this._onAddButtonClick(e)}>
                            <AddIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => this._onMenuClose()}
                        >
                            <MenuItem onClick={() => this._onMenuClick('create')}>Create Band</MenuItem>
                            <MenuItem onClick={() => this._onMenuClick('join')}>Join Band</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <div className={classes.grid}>
                    {bands.map((band, index) =>
                        <Card key={index} className={classes.card} onClick={() => this.props.dispatch(push(`/band/${band.id}`))}>
                            <CardMedia
                                className={classes.media}
                                image="https://4.bp.blogspot.com/-vq0wrcE-1BI/VvQ3L96sCUI/AAAAAAAAAI4/p2tb_hJnwK42cvImR4zrn_aNly7c5hUuQ/s1600/BandPeople.jpg"
                                title=""
                            />
                            <CardContent>
                                <Typography variant="headline" component="h2">
                                    {band.name}
                                </Typography>
                                <Typography component="p">
                                    Ba. ha ba ba. Ha ba ba ga da.
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <Dialog open={createDialogOpen} onClose={() => this._onDialogClose('create')}>
                    <DialogTitle>Create Band</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Name"
                            margin="normal"
                            onChange={e => this.setState({bandName: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => this._onDialogClose('create')}>Cancel</Button>
                        <Button color="primary" onClick={() => this._onDialogSubmit('create')} autoFocus>Create</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={joinDialogOpen} onClose={() => this._onDialogClose('join')}>
                    <DialogTitle>Join Band</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Code"
                            margin="normal"
                            onChange={e => this.setState({bandCode: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => this._onDialogClose('join')}>Cancel</Button>
                        <Button color="primary" onClick={() => this._onDialogSubmit('join')} autoFocus>Join</Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.default.user,
    bands: state.default.bands
})), withStyles(styles))(Home);