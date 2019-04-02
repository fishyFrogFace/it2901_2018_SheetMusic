import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {IconButton, Menu, MenuItem, Card, CardContent} from "material-ui";
import DeleteIcon from 'material-ui-icons/Delete';

import firebase from 'firebase';
import 'firebase/storage';

import AddSetlistScoresDialog from "../components/dialogs/AddSetlistScoresDialog";
import AddSetlistEventDialog from "../components/dialogs/AddSetlistEventDialog";
import EditSetlistDialog from "../components/dialogs/EditSetlistDialog";
import EditSetlistEventDialog from "../components/dialogs/EditSetlistEventDialog";
import AsyncDialog from '../components/dialogs/AsyncDialog';

import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import {Add, ArrowBack, Edit, MusicNote} from "material-ui-icons";
//import { isAdmin } from '@firebase/util';

const styles = {
    root: {},

    flex: {
        flex: 1
    },

    card: {
        width: 600,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 20
    }
};

class Setlist extends Component {
    state = {
        anchorEl: null,
        updatedItems: null,
        setlist: {},
        band: {},
        message: 'Looks like your setlist is empty, add some!'
    };

    addScoreDialog;
    addEventDialog;
    editSetlistDialog;

    unsubs = [];

    open = async () => {
        try {
           await this.dialog.open();
           return true;
        } catch (error) {
           return false;
        }
    }

    _onAddButtonClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }

    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    _onDragEnd = async result => {
        console.log("Result: " + JSON.stringify(result));
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const reorder = (list, startIndex, endIndex) => {
            const result = [...list];
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return result;
        };

        const {band, setlist} = this.state;

        const newItems = reorder(
            setlist.items,
            result.source.index,
            result.destination.index
        );

        this.setState({updatedItems: newItems});

        await firebase.firestore().doc(`bands/${band.id}/setlists/${setlist.id}`).update({
            items: newItems
        })
    };

    async _onMenuClick(type) {
        const {band, setlist} = this.state;
        const setlistRef = firebase.firestore().doc(`bands/${band.id}/setlists/${setlist.id}`);

        try {
            switch (type) {
                case 'addScore':
                    const selectedScoreIds = await this.addScoreDialog.open();

                    const scoreItems = selectedScoreIds.map(id => ({
                        type: 'score',
                        id: id,
                        scoreRef: firebase.firestore().doc(`bands/${band.id}/scores/${id}`)
                    }));

                    await setlistRef.update({
                        items: [...(setlist.items || []), ...scoreItems]
                    });
                    break;
                case 'addEvent':
                    const {eventTitle, description, time} = await this.addEventDialog.open();
                    await setlistRef.update({
                        items: [...(setlist.items || []), {
                            type: 'event',
                            title: eventTitle,
                            time: time,
                            description: description,
                            id: Math.random().toString(36).substring(2, 7),
                        }]
                    });
                    break;
                case 'editSetlist':
                    const {title, date, setlistTime} = await this.editSetlistDialog.open(setlist);
                    console.log('setlistTime: ' + setlistTime);
                    await setlistRef.update({title: title, date: date, time: setlistTime});
                    break;
            }
        } catch (err) {
            console.log(err);
        }

        this.setState({anchorEl: null});
    }

    _onArrowBackButtonClick = () => {
        window.location.hash = '/setlists';
    };

    //Remark: this function has some issues that need to be looked at
    //See the workaround
    componentDidUpdate(prevProps, prevState) {
        const {page, detail} = this.props;

        if (page !== prevProps.page) {
            const [bandId, setlistId] = [detail.slice(0, 20), detail.slice(20)];

            const bandRef = firebase.firestore().doc(`bands/${bandId}`);
            //console.log("bandRef: " + bandRef);

            const setlistDoc = bandRef.collection('setlists').doc(setlistId);
            //console.log("setlistDoc: " + setlistDoc);

            

            this.unsubs.forEach(unsub => unsub());

            this.unsubs.push(
                setlistDoc.onSnapshot(async snapshot => {
                    const data = snapshot.data();
                    //Workaround to fix deleting problem in setlists
                    if(data === undefined){
                        return;
                    }
                    //console.log("data: " + data);

                    data.items = await Promise.all(
                        (data.items || []).map(async item => {
                            if (item.type === 'score') {
                                return {...item, score: (await item.scoreRef.get()).data()};
                            }

                            return {...item};
                        })
                    );

                    this.setState({setlist: {...this.state.setlist, ...data, id: snapshot.id}});
                })
            );

            this.unsubs.push(
                bandRef.onSnapshot(async snapshot => {
                    this.setState({band: {...this.state.band, ...snapshot.data(), id: snapshot.id}});
                })
            );

            this.unsubs.push(
                bandRef.collection('scores').onSnapshot(async snapshot => {
                    let scores = await Promise.all(
                        snapshot.docs.map(async doc => ({...doc.data(), id: doc.id}))
                    );

                    this.setState({band: {...this.state.band, scores: scores}});
                })
            );
        }
    }

    //This function will take in a timestamp and display it in the correct date, hour and minute
    _formatedDate = (setlist) => {
        //Checks if setlist is a string and returns the formatted result
        if(typeof setlist === 'string'){
            //Formatting the date
            let dateString = setlist.slice(0,10);
            //console.log("dateString: " + dateString);
            
            //Formatting the time
            let timeString = setlist.slice(10,16);
            //console.log("timeString: " + timeString);
            return dateString + " " + timeString;
        }
    }

    //This function takes in an event id and it's title,
    //Warns the user about the action and deletes the event
    _onEventDeleteClick = async (eventId, eventTitle) => {
        //console.log("Event index: " + eventIndex);
        //console.log("Event title: " + eventTitle);
        
        this.setState({
            title: "Deleting event",
            message: `Are you sure you want to delete ${eventTitle}?`,
        });

        if (!await this.open()) return;

        const {detail} = this.props;
        
        const [bandId, setlistId] = [detail.slice(0, 20), detail.slice(20)];
        //console.log("bandId: " + bandId);
        //console.log("setlistId: " + setlistId);

        const setlistRef = firebase.firestore().doc(`bands/${bandId}/setlists/${setlistId}`);
        //console.log("setlistRef: " + setlistRef);

        let itemBandRef = (await setlistRef.get()).data().items || [];

        const filteredItems = await itemBandRef.filter(i => i.id !== eventId);

        await setlistRef.update({
            items: filteredItems
        });

    }

    //This function takes in a score id and it's title,
    //Warns the user about the action and deletes the score
    _onScoreDeleteClick = async (scoreId, scoreTitle) => {
        //console.log("Event index: " + eventIndex);
        //console.log("Event title: " + eventTitle);
        //console.log("Score id: " + scoreId);
        
        this.setState({
            title: "Deleting score",
            message: `Are you sure you want to delete ${scoreTitle}?`,
        });

        if (!await this.open()) return;

        const {detail} = this.props;
        
        const [bandId, setlistId] = [detail.slice(0, 20), detail.slice(20)];
        //console.log("score bandId: " + bandId);
        //console.log("score setlistId: " + setlistId);

        const setlistRef = firebase.firestore().doc(`bands/${bandId}/setlists/${setlistId}`);
        //console.log("score setlistRef: " + setlistRef);

        let itemBandRef = (await setlistRef.get()).data().items || [];

        const filteredItems = await itemBandRef.filter(i => i.id !== scoreId);

        await setlistRef.update({
            items: filteredItems
        });
    }

    //TODO: make it possible to edit an event
    _onEventEditClick = async(eventId, index) => {
        
        const {band, setlist} = this.state;
        //console.log("band: " + band);
        //console.log("setlist: " + setlist);
        const setlistRef = firebase.firestore().doc(`bands/${band.id}/setlists/${setlist.id}`);
        //console.log("setlistRef: " + setlistRef);
        
        const event = (await setlistRef.get()).data().items[index] || [];
        //console.log('event type: ' + event.type);
        //console.log('event id: ' + eventId);
        //console.log('event index: ' + index);
        //console.log(typeof(event));
        const {title, description, time} = await this.editSetlistEventDialog.open(event);
        //console.log('title: ' + title);
        //console.log('description: ' + description);
        //console.log('time: ' + time);

        let items = (await setlistRef.get()).data().items || [];

        const filteredItems = await items.filter(i => i.id !== eventId);

        const newItems = [...(filteredItems || []), {
            type: event.type,
            title: title,
            time: time,
            description: description,
            id: event.id,
        }]

        //Getting the item
        const item = newItems.filter(i => i.id === eventId)
        //console.log(item);
        //Splice is inserting item into filteredlist at index
        filteredItems.splice(index, 0, item[0]);
        //console.log(filteredItems);
    
        await setlistRef.update({
            items: filteredItems
        })
    }


    //TODO: make it possible to edit a score?
    _onScoreEditClick = async() => {
        
    }


    render() {
        const {anchorEl, updatedItems, setlist, band} = this.state;
        const {classes} = this.props;
        const eventIcon = <IconButton disabled>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                <path d="M13 7H5v2h8V7zm-3 3H5v2h5v-2zm5-8h-1V1h-2v1H6V1H4v1H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 12H4V6h10v8z"/>
            </svg>
        </IconButton>;

        let items;
        if(setlist.items){
            items = updatedItems || (setlist.items || []);
        }

        return (
            <div className={classes.root}>
                <DragDropContext onDragEnd={this._onDragEnd}>
                    <AppBar>
                        <Toolbar>
                            <IconButton color="inherit" onClick={() => this._onArrowBackButtonClick()}>
                                <ArrowBack/>
                            </IconButton>
                            <div style={{marginLeft: 10}}>
                                <Typography variant="title" color="inherit" className={classes.flex}>
                                    {setlist.title}
                                </Typography>
                                <Typography variant='subheading' color='inherit' className={classes.flex}>
                                    {/*Checking for date setlist.date, if that does not exist, then we don't get anything*/}
                                    {setlist.date && setlist.time && this._formatedDate(setlist.date + setlist.time)}
                                </Typography>
                            </div>
                            <div className={classes.flex}/>
                            <IconButton color="inherit" onClick={() => this._onMenuClick('editSetlist')}>
                                <Edit/>
                            </IconButton>
                            <IconButton color="inherit" aria-label="Menu" onClick={e => this._onAddButtonClick(e)}>
                                <Add/>
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
                    <div style={{paddingTop: 64 + 20}}>
                    {setlist.items &&
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) =>
                                <div ref={provided.innerRef}>
                                    {
                                        items.map((item, index) =>
                                            <Draggable
                                                key={index}
                                                draggableId={index}
                                                index={index}
                                            >
                                                {(provided, snapshot) =>
                                                    <div>
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <Card className={classes.card}>
                                                                {
                                                                    item.type === 'score' &&
                                                                    <CardContent style={{position: 'relative'}}>
                                                                        <Typography variant='headline'>
                                                                            <MusicNote style={{paddingRight:'10px'}}/>
                                                                            {item.score.title}
                                                                            
                                                                            <IconButton style={{position: 'absolute', right: '70px'}}>
                                                                                <Edit onClick={() => this._onScoreEditClick()}/>
                                                                            </IconButton>
                                                                            <IconButton style={{position: 'absolute', right: '25px'}}>
                                                                                <DeleteIcon onClick={() => this._onScoreDeleteClick(item.id, item.score.title)}/>
                                                                            </IconButton>
                                                                        </Typography>
                                                                        <Typography variant='subheading'>
                                                                            by {item.score.composer}
                                                                        </Typography>
                                                                        
                                                                    </CardContent>
                                                                }
                                                                {
                                                                    item.type === 'event' &&
                                                                    <CardContent style={{position: 'relative'}}>
                                                                        <Typography variant='headline'>
                                                                            {eventIcon}
                                                                            {item.title} | {item.time} minutes
                                                                        
                                                                            <IconButton style={{position: 'absolute', right: '70px'}}>
                                                                                <Edit onClick={() => this._onEventEditClick(item.id, index)}/>
                                                                            </IconButton>
                                                                            <IconButton style={{position: 'absolute', right: '25px'}}>
                                                                                <DeleteIcon onClick={() => this._onEventDeleteClick(item.id, item.title)}/>
                                                                            </IconButton>
                                                                        </Typography>
                                                                        <Typography variant='subheading'>
                                                                            {item.description}
                                                                        </Typography>
                                                                        
                                                                    </CardContent>
                                                                }
                                                            </Card>
                                                        </div>
                                                        {provided.placeholder}
                                                    </div>
                                                }
                                            </Draggable> 
                                        )
                                    }
                                </div>
                            }
                        </Droppable> }
                    </div>
                </DragDropContext>
                <AddSetlistScoresDialog band={band} onRef={ref => this.addScoreDialog = ref}/>
                <AddSetlistEventDialog onRef={ref => this.addEventDialog = ref}/>
                <EditSetlistDialog onRef={ref => this.editSetlistDialog = ref}/>
                <EditSetlistEventDialog onRef={ref => this.editSetlistEventDialog = ref}/>
                
                <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
                    <Typography variant="body1" >{this.state.message}</Typography>
                </AsyncDialog>
            </div>
        );
    }
}


export default withStyles(styles)(Setlist);