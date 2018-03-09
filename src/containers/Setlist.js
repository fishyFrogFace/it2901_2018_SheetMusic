import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {
    IconButton, Menu, MenuItem
} from "material-ui";
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import AddIcon from 'material-ui-icons/Add';

import firebase from 'firebase';
import 'firebase/storage';

import AddSetlistScoresDialog from "../components/dialogs/AddSetlistScoresDialog";
import AddSetlistEventDialog from "../components/dialogs/AddSetlistEventDialog";

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
        console.log();
       await Promise.all(arrIds.map(async (arr, index) =>
            await   firebase.firestore().collection(`setlists/${setlistid}/scores`)
                    .add({order: currLength + index, ref: firebase.firestore().doc(`scores/${arrIds[index]}`)})));

    }
    _onAddButtonClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }
    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    async addSetlistEvent(setlistId, eventTitle, eventDesc, currLength){
        try{
            await firebase.firestore().collection(`setlists/${setlistId}/events`).add({order: currLength, title:eventTitle, desc:eventDesc});
        }catch(err){
            console.error(err);
        }
    }

    _onDragEnd = result => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const reorder = (list, startIndex, endIndex) => {
            const result = Array.from(list);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        };


        const combinedArray = reorder(
            this.state.setlist.combinedArray,
            result.source.index,
            result.destination.index
        ).map((arr, index) => arr = {...arr, order: index});



        this.setState({setlist:{...this.state.setlist, scores: combinedArray}})

        this.updateFirebaseOrders(this.state.setlist.id, combinedArray);
    };

    unsubscribeCallbacks = [];

    async _onMenuClick(type) {
        switch(type){
            case 'addScore':
                var selectedScores = await this.addScoreDialog.open(this.state.bandScores);
                this.addSetListScores(this.state.setlist.id, selectedScores, this.state.setlist.combinedArray.length);
                break;
            case 'addEvent':
                const {title, description} = await this.addEventDialog.open();
                this.addSetlistEvent(this.state.setlist.id, title, description, this.state.setlist.combinedArray.length);
                break;
            default:
                break;
        }
        this.setState({anchorEl: null});
    }

    async fetchSetlistData (setlistID){
        let doc = await firebase.firestore().doc(`setlists/${setlistID}`).get();
        let setlist = doc.data();
        try{
            var scoresCollection = await firebase.firestore().collection(`setlists/${setlistID}/scores`).get();
            var setlistScores = await Promise.all(scoresCollection.docs.map(async doc => {
                let score = await doc.data().ref.get();
                return {id: doc.id, order: doc.data().order, ...score.data(), type:0};
            }));
            setlistScores = setlistScores.sort((a, b) => a.order - b.order);
        }catch(e){
            console.log(e);
            var setlistScores = [];
        }

        try{
            var eventCollection = await firebase.firestore().collection(`setlists/${setlistID}/events`).get();
            var events = await Promise.all(eventCollection.docs.map(async doc => {
                return {id: doc.id, ...doc.data(), type:1};
            }));
            events = events.sort((a, b) => a.order - b.order);
        }catch(e){
            console.log(e);
            var events = [];
        }


        let combinedArray = Array.from(events);
        combinedArray.push.apply(combinedArray, setlistScores);
        combinedArray = combinedArray.sort((a, b) => a.order - b.order);

        let bandSnapshot = await setlist.band.get();
        const bandScoresSnapshot =  await firebase.firestore().collection(`bands/${bandSnapshot.id}/scores`).get();

        let bandScores = await Promise.all(bandScoresSnapshot.docs.map(async doc => {
            let score = await doc.data().ref.get();

            return {id: score.id, ...score.data()};
        }));
        this.setState({setlist: {id: setlistID, ...setlist, scores: setlistScores, events: events, combinedArray: combinedArray}, bandid: bandSnapshot.id, bandScores:bandScores } );
    }


    async componentWillMount() {
        let setlistId = this.props.detail;

        await this.fetchSetlistData(setlistId);

        this.unsubscribeCallbacks.push( firebase.firestore().collection(`setlists/${setlistId}/scores`).onSnapshot(async snapshot => {
            const scores = await Promise.all(
                snapshot.docs.map(async doc => {
                    let score = await doc.data().ref.get();
                    return {id: doc.id, order: doc.data().order, ...score.data(), type:0}
                })
            );

            let combinedArray = this.state.setlist.combinedArray;
            for(var e in scores){
                var score = combinedArray.find((arr) => arr.id === scores[e].id);

                if (!score){
                    combinedArray.push(scores[e]);
                }else{
                    score.order = scores[e].order;
                }
            }
        
            this.setState({
                setlist: {...this.state.setlist, scores: scores, combinedArray: combinedArray.sort((a, b) => a.order - b.order)}
            });
        }));

        this.unsubscribeCallbacks.push( firebase.firestore().collection(`setlists/${setlistId}/events`).onSnapshot(async snapshot => {
            const events = await Promise.all(
                snapshot.docs.map(async doc => {
                    return {id: doc.id, order: doc.data().order, ...doc.data(), type:1}
                })
            );

            let combinedArray = this.state.setlist.combinedArray;
            for(var e in events){
                var event = combinedArray.find( (arr) => arr.id === events[e].id);

                if (!event){
                    combinedArray.push(events[e]);
                }else{
                    event.order = events[e].order;
                }
            }

            this.setState({
                setlist: {...this.state.setlist, events: events, combinedArray: combinedArray.sort((a, b) => a.order - b.order)}
            });
        }));
    }

    componentWillUnmount(){
        this.unsubscribeCallbacks.forEach(c => c());
    }


    async updateFirebaseOrders(setlistId, combined){
        Promise.all(combined.map(async (score, index) => {
            switch(score.type){
                case 0:
                    await firebase.firestore().doc(`setlists/${setlistId}/scores/${score.id}`).update({order:index});
                    break;
                case 1:
                    await firebase.firestore().doc(`setlists/${setlistId}/events/${score.id}`).update({order:index});
                    break;
                default:
                    break;
            }
        }));
    }

    async _onArrowBackButtonClick() {
        window.location.hash = `#/band/${this.state.bandid}`;
    }

    render() {
        const { anchorEl, setlist} = this.state;
        const {classes} = this.props;

        return (
            <div className={classes.root}>
            <DragDropContext onDragEnd={this._onDragEnd}>
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
                            <MenuItem onClick={() => this._onMenuClick('addEvent')}>Add Event</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <div>

                    <div className={classes.listView}>

                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => 
                                <div ref={provided.innerRef}>
                                    {
                                        setlist.combinedArray && setlist.combinedArray.map((score, index) =>
                                            <Draggable 
                                                key={score.id + score.type}
                                                draggableId={score.id + score.type}
                                                index={index}
                                            >
                                                {(provided, snapshot) =>
                                                    <div>
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <div style={{
                                                                width: '100%',
                                                                height: 50,
                                                                border: '1px solid black'
                                                            }}>
                                                                {(score.type === 0 ) ? `${score.order + 1}. ${score.title} by ${score.composer}`: `${score.order + 1} ${score.title} | ${score.desc}` }
                                                            </div>
                                                        </div>
                                                        {provided.placeholder}
                                                    </div>
                                                }
                                            </Draggable>
                                        )   
                                    }
                                </div>
                            }
                        </Droppable>
                    </div>
                </div>
                </DragDropContext>
                <AddSetlistScoresDialog onRef= {ref => this.addScoreDialog = ref}/>
                <AddSetlistEventDialog onRef= {ref => this.addEventDialog = ref}/>
            </div>
        );
    }
}


export default withStyles(styles)(Setlist);