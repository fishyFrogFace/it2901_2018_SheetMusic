import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import { IconButton, Menu, MenuItem, Card, CardContent } from "material-ui";

import firebase from 'firebase';
import 'firebase/storage';

import AddSetlistScoresDialog from "../components/dialogs/AddSetlistScoresDialog";
import AddSetlistEventDialog from "../components/dialogs/AddSetlistEventDialog";
import EditSetlistDialog from "../components/dialogs/EditSetlistDialog";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Add, ArrowBack, Edit, FileDownload } from "material-ui-icons";

import jsPDF from 'jspdf';
import { async } from '@firebase/util';

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
        band: {}
    };

    addScoreDialog;
    addEventDialog;
    editSetlistDialog;

    unsubs = [];

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

        // try {
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
                    const { eventTitle, description, time } = await this.addEventDialog.open();
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
                    const { title, date } = await this.editSetlistDialog.open(setlist);
                    await setlistRef.update({ title: title, date: date });
                    break;
                case 'download':
                        // console.log("State");
                        // console.log(this.state);
                        const items = this.state.setlist.items;
                        const dateString = new Date().toLocaleDateString();

                        // Get image
                        const { width, height } = await new Promise(async resolve => {
                            const img = new Image();
                            let src;
                            for(let i = 0; i < items.length; i++) {
                                if(items[i].type == "score") {
                                    await items[i].scoreRef.collection('parts').get().then(function(querySnapshot) {
                                        src = querySnapshot.docs[0].data().pages[0].originalURL;
                                    });
                                    break;
                                }
                            }
                            img.onload = () => resolve(img);
                            img.src = src;
                        });

                        var array = [];
                        items.forEach((item) => {
                            switch(item.type) {
                                case('event'):
                                    array.push(new Promise(resolve => {
                                        resolve([[item.title, item.description, item.time]]);
                                    }));
                                    console.log(item);
                                    break;

                                case('score'):
                                    array.push(new Promise(resolve => {
                                        item.scoreRef.collection('parts').get().then(async function(querySnapshot) {
                                            let ar = [];
                                            let arOfAr = [];
                                            // Iterate through parts
                                            for (const part of querySnapshot.docs) {
                                                for (const page of part.data().pages) {
                                                    
                                                    const url = page.originalURL;
                                                    const response = await fetch(url);
                                                    const blob = await response.blob();
    
                                                    const imageData = await new Promise((resolve, reject) => {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => resolve(reader.result);
                                                        reader.onerror = reject;
                                                        reader.readAsDataURL(blob);
                                                    });
                                                    ar.push(imageData);
                                                };
                                                arOfAr.push(ar);
                                                ar = [];
                                            };
                                            resolve(arOfAr);
                                        })
                                    }));
                                    break;
                            }
                        });
                        Promise.all(array).then(function(values) {
                            let firstpage = true;

                            // Make PDF
                            const size_increase = 1.33334;
                            const doc = new jsPDF('p', 'px', 'a4');
                            const titleSize = 26;
                            const normalSize = 12;
                            const linelen = 80;     //In characters
                            const leftmargin = 70;  //In pixels
                            doc.setFont('arial');
                            doc.setFontSize(normalSize);
                            const a4_size = [595.28, 841.89];

                            values.forEach(array => {
                                array.forEach(items => {

                                    if(items[0].startsWith("data:image/png;base64,")) {
                                        console.log("Image");
                                        items.forEach(item => {
                                            if(firstpage) firstpage = false;
                                            else doc.addPage();

                                            doc.addImage(item, 'PNG', 0, 0, a4_size[0]/size_increase, a4_size[1]/size_increase);
                                            doc.text(`${dateString}     ${setlist.title}     Downloaded by: user     Page: something`, 20, 625);
                                            // doc.text(`${dateString}     ${setlist.title}     Downloaded by: user     Page: ssssthing`, 20, a4_size[1]-250);
                                        });
                                    } else {
                                        if(firstpage) firstpage = false;
                                        else doc.addPage();

                                        let y = 80;             //Pixels
                                        const dy = 12;          //Pixels

                                        console.log("string");
                                        var desc = items[1];
                                        desc = "Based on your input, get a random alpha numeric string. The random string generator creates a series of numbers and letters that have no pattern. These can be helpful for creating security codes. With this utility you generate a 16 character output based on your input of numbers and upper and lower case letters.  Random strings can be unique. Used in computing, a random string generator can also be called a random character string generator. This is an important tool if you want to generate a unique set of strings. The utility generates a sequence that lacks a pattern and is random. Throughout time, randomness was generated through mechanical devices such as dice, coin flips, and playing cards. A mechanical method of achieving randomness can be more time and resource consuming especially when a large number of randomized strings are needed as they could be in statistical applications.  Computational random string generators replace the traditional mechanical devices. ";
                                        desc = desc + desc + desc + desc + desc + desc + desc;
                                        //Title
                                        doc.setFontSize(titleSize);
                                        doc.text(items[0], leftmargin, 50); 

                                        doc.setFontSize(normalSize);

                                        //Description
                                        while (desc.length > 0) {
                                            //Remove start of line space
                                            if(desc[0] == " ") {
                                                desc = desc.substring(1, desc.length);
                                            }
                                            let lineToBeAdded = desc.substring(0, linelen);
                                            desc = desc.substring(linelen, desc.length);

                                            //Test if line-break is in the middle of a word
                                            if(lineToBeAdded[lineToBeAdded.length-1] != " " && desc[0] != " ") {
                                                lineToBeAdded += "-";
                                            }
                                            doc.text(lineToBeAdded, leftmargin, y); 
                                            y += dy;
                                        }

                                        //Time
                                        doc.text(items[2] + " minutes", leftmargin, 600);
                                    }       
                                });
                            });
                            console.log("Download");
                            doc.save(`${setlist.title}.pdf`);
                            // console.log(values);
                        });
                        break;
                }
            // } catch (err) {
            //     console.log(err);
            // }

        this.setState({ anchorEl: null });
    }

    _onArrowBackButtonClick = () => {
        window.location.hash = '/setlists';
    };

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
        }
    }

    render() {
        const { anchorEl, updatedItems, setlist, band } = this.state;
        const { classes } = this.props;

        const items = updatedItems || (setlist.items || []);

        return (
            <div className={classes.root}>
                <DragDropContext onDragEnd={this._onDragEnd}>
                    <AppBar>
                        <Toolbar>
                            <IconButton color="inherit" onClick={() => this._onArrowBackButtonClick()}>
                                <ArrowBack />
                            </IconButton>
                            <div style={{ marginLeft: 10 }}>
                                <Typography variant="title" color="inherit" className={classes.flex}>
                                    {setlist.title}
                                </Typography>
                                <Typography variant='subheading' color='inherit' className={classes.flex}>
                                    {/*setlist.date && setlist.date.toLocaleDateString()*/}
                                </Typography>
                            </div>
                            <div className={classes.flex} />
                            <IconButton color="inherit" onClick={() => this._onMenuClick('download')}>
                                <FileDownload />
                            </IconButton>
                            <IconButton color="inherit" onClick={() => this._onMenuClick('editSetlist')}>
                                <Edit />
                            </IconButton>
                            <IconButton color="inherit" aria-label="Menu" onClick={e => this._onAddButtonClick(e)}>
                                <Add />
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
                    <div style={{ paddingTop: 64 + 20 }}>
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
                <AddSetlistScoresDialog band={band} onRef={ref => this.addScoreDialog = ref} />
                <AddSetlistEventDialog onRef={ref => this.addEventDialog = ref} />
                <EditSetlistDialog onRef={ref => this.editSetlistDialog = ref} />
            </div>
        );
    }
}


export default withStyles(styles)(Setlist);