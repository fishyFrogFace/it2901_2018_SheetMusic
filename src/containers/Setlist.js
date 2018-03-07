import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {
    Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem,
    Snackbar,
    TextField
} from "material-ui";
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import AddIcon from 'material-ui-icons/Add';
import MoreVertIcon from 'material-ui-icons/MoreVert';

import firebase from 'firebase';
import 'firebase/storage';

import AddSetlistScoresDialog from "../components/dialogs/AddSetlistScoresDialog";

import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";

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
    listCard: {
        width: '100%',
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
    },
    selectable: {
        height: 150,
        marginBottom: 20
    },
    listView: {
        marginLeft: '20%',
        marginTop:20,
        width:'60%'
    }
};




class Setlist extends Component {

    state = {
        anchorEl: null,
        addArrDialogOpen: false,
        addPauseDialogOpen: false,
        setlist: {},
        bandid: '',
        bandScores: []
    };

    addScoreDialog = null;

    async addSetListScores (setlistid, arrIds, currLength){
        let doc = await firebase.firestore().doc(`setlists/${setlistid}`);
    
        let promise = await Promise.all(arrIds.map(async (arr, index) =>
            await firebase.firestore().collection(`setlists/${setlistid}/scores`).add({order: currLength + index, ref: firebase.firestore().doc(`scores/${arrIds[index]}`)})));

    }
    _onAddButtonClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }
    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    _onMenuClick(type) {
        switch(type){
            case 'addScore':
                var selectedScores = this.addScoreDialog.open(this.state.bandScores);
                break;
        }
        this.setState({anchorEl: null});
    }

    async fetchSetlistData (setlistID){
        let doc = await firebase.firestore().doc(`setlists/${setlistID}`).get();
        let setlist = doc.data();

        let bandSnapshot = await setlist.band.get();
        const scoresSnapshot =  await firebase.firestore().collection(`bands/${bandSnapshot.id}/scores`).get();

        let scores = await Promise.all(scoresSnapshot.docs.map(async doc => {
            let score = await doc.data().ref.get();

            return {id: doc.id, ...score.data()};
        }));
        this.setState({setlist: setlist, bandid: bandSnapshot.id, bandScores:scores } );
    }


    componentWillMount() {
        let setlistId = this.props.detail;

        this.fetchSetlistData(setlistId);

        this.unsubscribe = firebase.firestore().collection(`setlists/${setlistId}/scores`).onSnapshot(async snapshot => {
            const scores = await Promise.all(
                snapshot.docs.map(async doc => ({
                    ...doc.data(),
                    id: doc.id
                }))
            );
            this.setState({
                setlist: {...this.state.setlist, scores: scores}
            });
        });
    }

    async _onArrowBackButtonClick() {
        window.location.hash = `#/band/${this.state.bandid}`;
    }

    render() {
        const { anchorEl, addArrDialogOpen, addPauseDialogOpen, setlist, bandScores} = this.state;
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                 <AppBar position="static">
                    <Toolbar>
                        <IconButton color="inherit" onClick={() => this._onArrowBackButtonClick()}>
                            <ArrowBackIcon/>
                        </IconButton>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            {setlist.title}
                        </Typography>
                        <IconButton color="inherit" aria-label="Menu" onClick={e => this._onAddButtonClick(e)}>
                            <AddIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => this._onMenuClose()}
                        >
                            <MenuItem onClick={() => this._onMenuClick('addScore')}>Add Score</MenuItem>
                            <MenuItem onClick={() => this._onMenuClick('addEvent')}>Add Pause</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <div>

                    <div className={classes.listView}>{setlist.scores && setlist.scores.sort((a, b) => a.order - b.order).map((arr, id) => 
                        <Card className={classes.listCard} key={id} order={arr.order} onMouseDown={this._onMouseDown} >
                            <CardContent>
                                <Typography variant="headline" component="h2">
                                    {arr.order + 1}. {arr.title}
                                </Typography>
                                <Typography component="p">
                                    {arr.composer}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                    </div>
                </div>
                <AddSetlistScoresDialog onRef= {ref => this.addScoreDialog = ref}/>
            </div>
        );
    }
}


export default withStyles(styles)(Setlist);