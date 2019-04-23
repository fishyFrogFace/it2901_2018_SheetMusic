import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

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
        message: 'Looks like your setlist is empty, add some!',
        hasRights: true,
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
        this.setState({ anchorEl: e.currentTarget });
    }

    _onMenuClose() {
        this.setState({ anchorEl: null });
    }

    _onDragEnd = async result => {
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

        const { band, setlist } = this.state;

        const newItems = reorder(
            setlist.items,
            result.source.index,
            result.destination.index
        );

        this.setState({ updatedItems: newItems });

        await firebase.firestore().doc(`bands/${band.id}/setlists/${setlist.id}`).update({
            items: newItems
        })
    };

    async _onMenuClick(type) {
        const { band, setlist } = this.state;
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
                    const { eventTitle, description, time } = await this.addEventDialog.open();
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
                    await setlistRef.update({title: title, date: date, time: setlistTime});
                    break;
            }
        } catch (err) {
            console.log(err);
        }

        this.setState({ anchorEl: null });
    }

    _onArrowBackButtonClick = () => {
        window.location.hash = '/setlists';
    };

    //Remark: this function has some issues that need to be looked at
    //See the workaround
    componentDidUpdate(prevProps, prevState) {
        const { page, detail } = this.props;

        if (page !== prevProps.page) {
            const [bandId, setlistId] = [detail.slice(0, 20), detail.slice(20)];

            const bandRef = firebase.firestore().doc(`bands/${bandId}`);

            const setlistDoc = bandRef.collection('setlists').doc(setlistId);

            this.unsubs.forEach(unsub => unsub());

            this.unsubs.push(
                setlistDoc.onSnapshot(async snapshot => {
                    const data = snapshot.data();
                    //Workaround to fix deleting problem in setlists
                    if(data === undefined){
                        return;
                    }

                    data.items = await Promise.all(
                        (data.items || []).map(async item => {
                            if (item.type === 'score') {
                                return { ...item, score: (await item.scoreRef.get()).data() };
                            }

                            return { ...item };
                        })
                    );

                    this.setState({ setlist: { ...this.state.setlist, ...data, id: snapshot.id } });
                })
            );

            this.unsubs.push(
                bandRef.onSnapshot(async snapshot => {
                    this.setState({ band: { ...this.state.band, ...snapshot.data(), id: snapshot.id } });
                })
            );

            this.unsubs.push(
                bandRef.collection('scores').onSnapshot(async snapshot => {
                    let scores = await Promise.all(
                        snapshot.docs.map(async doc => ({ ...doc.data(), id: doc.id }))
                    );

                    this.setState({ band: { ...this.state.band, scores: scores } });
                })
            );

            const { currentUser } = firebase.auth();
            this.setState({
                user: currentUser.uid,
                hasRights: false,
            });

            bandRef.get().then(snapshot => {

                const leader = (snapshot.data() === undefined) ? null : snapshot.data().creatorRef.id;
                if (currentUser.uid === leader) {
                    this.setState({
                        hasRights: true
                    })
                    return;
                }

            });

            bandRef.collection('members').onSnapshot(async snapshot =>{
                const members = await Promise.all(
                    snapshot.docs.map(async doc => ({ ...doc.data(), ref: doc.ref }))
                );
                for (let i in members) {
                    if (currentUser.uid === members[i].uid) {
                        if(members[i].admin || members[i].supervisor){
                            this.setState({
                                hasRights: true
                            });
                        }
                    }
                }
            });  
        }
    }

    //This function checks that setlistDate is a string, if so returns it and a space
    _formatedDate = (setlistDate) => {
        if(typeof setlistDate === 'string'){
            return setlistDate + " ";
        }
    }

    //This function checks that setlistTime is a string, if so returns it
    _formatedTime = (setlistTime) => {
        if(typeof setlistTime === 'string'){
            return setlistTime;
        }
    }

    //This function takes in an event id and it's title,
    //Warns the user about the action and deletes the event
    _onEventDeleteClick = async (eventId, eventTitle) => {
        
        this.setState({
            title: "Deleting event",
            message: `Are you sure you want to delete ${eventTitle}?`,
        });

        if (!await this.open()) return;

        const {detail, band} = this.props;
        
        const [bandId, setlistId] = [detail.slice(0, 20), detail.slice(20)];

        const setlistRef = firebase.firestore().doc(`bands/${bandId}/setlists/${setlistId}`);

        let itemBandRef = (await setlistRef.get()).data().items || [];

        const filteredItems = await itemBandRef.filter(i => i.id !== eventId);
        
        if (this.state.hasRights) {
            await setlistRef.update({
                items: filteredItems
            });
        }
    }

    //This function takes in a score id and it's title,
    //Warns the user about the action and deletes the score
    _onScoreDeleteClick = async (scoreId, scoreTitle) => {
        
        this.setState({
            title: "Deleting score",
            message: `Are you sure you want to delete ${scoreTitle}?`,
        });

        if (!await this.open()) return;

        const {detail} = this.props;
        
        const [bandId, setlistId] = [detail.slice(0, 20), detail.slice(20)];

        const setlistRef = firebase.firestore().doc(`bands/${bandId}/setlists/${setlistId}`);

        let itemBandRef = (await setlistRef.get()).data().items || [];

        const filteredItems = await itemBandRef.filter(i => i.id !== scoreId);

        if (this.state.hasRights) {
            await setlistRef.update({
                items: filteredItems
            });
        }    
    }

    //This function takes in an event, changes the title, description and time of that event
    //And then makes a new list of items with the updated event
    _onEventEditClick = async(eventId, index) => {
        
        const {band, setlist} = this.state;
        const setlistRef = firebase.firestore().doc(`bands/${band.id}/setlists/${setlist.id}`);
        
        const event = (await setlistRef.get()).data().items[index] || [];
        const {title, description, time} = await this.editSetlistEventDialog.open(event);

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
        //Splice is inserting item into filteredlist at index
        filteredItems.splice(index, 0, item[0]);
        if (this.state.hasRights) {
            await setlistRef.update({
                items: filteredItems
            });
        }
    }

    render() {
        const {anchorEl, updatedItems, setlist, band} = this.state;
        const {classes} = this.props;
        const eventIcon = <IconButton disabled >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="2 2 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
        </IconButton>;
        const { hasRights } = this.state;
        let items;
        if(setlist.items){
            items = updatedItems || (setlist.items || []);
        }

        console.log('this.state.band', this.state.band)
        console.log('this.props', this.props)

        return (
            <div className={classes.root}>
                <DragDropContext onDragEnd={this._onDragEnd}>
                    <AppBar>
                        <Toolbar>
                            <IconButton color="inherit" onClick={() => this._onArrowBackButtonClick()}>
                                <ArrowBack id="arrow-back-button"/>
                            </IconButton>
                            <div style={{ marginLeft: 10 }}>
                                <Typography variant="title" color="inherit" className={classes.flex}>
                                    {setlist.title}
                                </Typography>
                                <Typography variant='subheading' color='inherit' className={classes.flex}>
                                    {/*Checking for date setlist.date, if that does not exist, then we don't get anything, same with setlist.time*/}
                                    {setlist.date && this._formatedDate(setlist.date)}
                                    {setlist.time && this._formatedTime(setlist.time)}
                                </Typography>
                            </div>
                            <div className={classes.flex} />
                            {hasRights && <IconButton color="inherit" onClick={() => this._onMenuClick('editSetlist')}>
                                <Edit id="menu-edit-button"/>
                            </IconButton>}
                            {hasRights && <IconButton color="inherit" aria-label="Menu" onClick={e => this._onAddButtonClick(e)}>
                                <Add id="menu-add-button"/>
                            </IconButton>}
                            <Menu 
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={() => this._onMenuClose()}
                            >
                                <MenuItem id="add-score-menu-button" onClick={() => this._onMenuClick('addScore')}>Add Score</MenuItem>
                                <MenuItem id="add-event-menu-button" onClick={() => this._onMenuClick('addEvent')}>Add Event</MenuItem>
                            </Menu>
                        </Toolbar>
                    </AppBar>
                    <div style={{paddingTop: 64 + 20}}>
                    {/*!setlist.items && <Typography>You have not added any events or scores, click the + button to add some!</Typography>*/}
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
                                                isDragDisabled={!hasRights}
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
                                                                        <Typography variant='headline' id="event-card-typography">
                                                                            <MusicNote style={{paddingRight:'10px'}}/>
                                                                            {item.score.title}
                                                                            
                                                                            {hasRights && <IconButton style={{position: 'absolute', right: '25px'}}>
                                                                                <DeleteIcon id="score-delete-button" onClick={() => this._onScoreDeleteClick(item.id, item.score.title)}/>
                                                                            </IconButton>}
                                                                        </Typography>
                                                                        <Typography variant='subheading'>
                                                                            by {item.score.composer}
                                                                        </Typography>
                                                                        
                                                                    </CardContent>
                                                                }
                                                                {
                                                                    item.type === 'event' &&
                                                                    <CardContent style={{position: 'relative'}} >
                                                                        <Typography variant='headline' id="event-card-typography">
                                                                            {eventIcon}
                                                                            {item.title} | {item.time} minutes
                                                                        
                                                                            {hasRights && <IconButton id="event-edit-button" style={{position: 'absolute', right: '70px'}}>
                                                                                <Edit onClick={() => this._onEventEditClick(item.id, index)}/>
                                                                            </IconButton>}
                                                                            {hasRights && <IconButton id="event-delete-button" style={{position: 'absolute', right: '25px'}}>
                                                                                <DeleteIcon  onClick={() => this._onEventDeleteClick(item.id, item.title)}/>
                                                                            </IconButton>}
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