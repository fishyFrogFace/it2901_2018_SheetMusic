import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {push} from 'react-router-redux';

import {addArrangement, getBandDetail} from "../actions";
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

    dialogContent: {
        display: 'flex',
        flexDirection: 'column'
    },
    card: {
        width: 300,
        marginRight: 24,
        marginBottom: 24,
        cursor: 'pointer'
    },
    media: {
        height: 200,
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: 24
    },
    banner: {
        background: 'url(https://4.bp.blogspot.com/-vq0wrcE-1BI/VvQ3L96sCUI/AAAAAAAAAI4/p2tb_hJnwK42cvImR4zrn_aNly7c5hUuQ/s1600/BandPeople.jpg) center center no-repeat',
        backgroundSize: 'cover',
        height: 144
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

    requestBandDetail() {
        let bandId = this.props.pathname.split('/')[2];
        this.props.dispatch(getBandDetail(bandId));
    }

    componentWillMount() {
        if (this.props.user) {
            this.requestBandDetail();
        }
    }

    componentWillReceiveProps(props) {
        if (!this.props.user && props.user) {
            this.requestBandDetail();
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
        const {classes, band={arrangements: []}} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            {band.name}
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
                <div className={classes.banner}></div>
                <div className={classes.grid}>
                    {band.arrangements.map((arr, index) =>
                        <Card key={index} className={classes.card} onClick={() => this.props.dispatch(push(`/arrangement/${arr.id}`))} elevation={1}>
                            <CardMedia
                                className={classes.media}
                                image="https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"
                                title=""
                            />
                            <CardContent>
                                <Typography variant="headline" component="h2">
                                    {arr.title}
                                </Typography>
                                <Typography component="p">
                                    {arr.composer}
                                </Typography>
                            </CardContent>
                        </Card>
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
    band: state.default.band,
    pathname: state.router.location.pathname
})), withStyles(styles))(Band);

