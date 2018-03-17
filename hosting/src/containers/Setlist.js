import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {IconButton, Menu, MenuItem, Card, CardContent} from "material-ui";

import firebase from 'firebase';
import 'firebase/storage';

import AddSetlistScoresDialog from "../components/dialogs/AddSetlistScoresDialog";
import AddSetlistEventDialog from "../components/dialogs/AddSetlistEventDialog";
import EditSetlistDialog from "../components/dialogs/EditSetlistDialog";

import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import {Add, ArrowBack, Edit} from "material-ui-icons";

const styles = {
    root: {},

    flex: {
        flex: 1
    }
};

class Setlist extends Component {
    state = {
        anchorEl: null,
        updatedItems: null
    };

    addScoreDialog;
    addEventDialog;
    editSetlistDialog;

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

        const {band, setlist} = this.props;

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
        const {band, setlist} = this.props;
        const setlistRef = firebase.firestore().doc(`bands/${band.id}/setlists/${setlist.id}`);

        try {
            switch (type) {
                case 'addScore':
                    const selectedScoreIds = await this.addScoreDialog.open();

                    const scoreItems = selectedScoreIds.map(id => ({
                        type: 'score',
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
                            description: description
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

    render() {
        const {anchorEl, updatedItems} = this.state;
        const {classes, setlist, band} = this.props;

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
                                    {setlist.date && setlist.date.toLocaleDateString()}
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
                    <div style={{paddingTop: 64}}>
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
                                                                    <CardContent>
                                                                        <Typography variant='headline'>
                                                                            {item.score.title}
                                                                        </Typography>
                                                                        <Typography variant='subheading'>
                                                                            by {item.score.composer}
                                                                        </Typography>
                                                                    </CardContent>
                                                                }
                                                                {
                                                                    item.type === 'event' &&
                                                                    <CardContent>
                                                                        <Typography variant='headline'>
                                                                            {item.title} | {item.time} minutes
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
            </div>
        );
    }
}


export default withStyles(styles)(Setlist);