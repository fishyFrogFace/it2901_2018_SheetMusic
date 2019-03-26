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
import AsyncDialog from '../components/dialogs/AsyncDialog';

import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import {Add, ArrowBack, Edit} from "material-ui-icons";

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
                    const {title, date} = await this.editSetlistDialog.open(setlist);
                    await setlistRef.update({title: title, date: date});
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

    componentDidUpdate(prevProps, prevState) {
        const {page, detail} = this.props;

        if (page !== prevProps.page) {
            const [bandId, setlistId] = [detail.slice(0, 20), detail.slice(20)];

            const bandRef = firebase.firestore().doc(`bands/${bandId}`);

            const setlistDoc = bandRef.collection('setlists').doc(setlistId);

            this.unsubs.forEach(unsub => unsub());

            this.unsubs.push(
                setlistDoc.onSnapshot(async snapshot => {
                    const data = snapshot.data();

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

            /* Formatting for norwegian date, not in use at this time
            let dayString = dateString.slice(8,10);
            console.log("dayString: " + dayString);

            let monthString = dateString.slice(5,7);
            console.log("monthString: " + monthString);

            let yearString = dateString.slice(0,4);
            console.log("dayString: " + yearString);
            */
            
            //Formatting the time
            let timeString = setlist.slice(11,16);
            //console.log("timeString: " + timeString);
            return dateString + " " + timeString;
        }
        //Converting our timestamp to a date string object
        let dateString = setlist.toDate().toString();
        //Using the splice method to format the string in date, hours and minutes
        let formatedString = dateString.split('');
        //Splicing the interval we want to remove
        formatedString.splice(21,45);
        formatedString = formatedString.join('');
        return formatedString;
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


    render() {
        const {anchorEl, updatedItems, setlist, band} = this.state;
        const {classes} = this.props;

        const items = updatedItems || (setlist.items || []);

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
                                    {setlist.date && this._formatedDate(setlist.date)}
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
                                                                            {item.score.title}
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
                                                                            {item.title} | {item.time} minutes
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
                        </Droppable>
                    </div>
                </DragDropContext>
                <AddSetlistScoresDialog band={band} onRef={ref => this.addScoreDialog = ref}/>
                <AddSetlistEventDialog onRef={ref => this.addEventDialog = ref}/>
                <EditSetlistDialog onRef={ref => this.editSetlistDialog = ref}/>
                
                <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
                    <Typography variant="body1" >{this.state.message}</Typography>
                </AsyncDialog>
            </div>
        );
    }
}


export default withStyles(styles)(Setlist);