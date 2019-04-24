import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import { IconButton, Menu, MenuItem, Card, CardContent } from "material-ui";

import firebase from 'firebase';
import 'firebase/storage';

import DownloadSetlistDialog from "../components/dialogs/DownloadSetlistDialog";
import AddSetlistScoresDialog from "../components/dialogs/AddSetlistScoresDialog";
import AddSetlistEventDialog from "../components/dialogs/AddSetlistEventDialog";
import EditSetlistDialog from "../components/dialogs/EditSetlistDialog";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Add, ArrowBack, Edit, FileDownload } from "material-ui-icons";

import jsPDF from 'jspdf';
import { async } from '@firebase/util';
import { func } from 'prop-types';

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
    downloadSetlistDialog;

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
                    let instrArr = [];              // Array of instruments in the setlist
                    let st = null;                  // State returned from dialog
                    let selectedInstrument = null;  // Selected instrument in dialog
                    const thiss = this;             // For use in the promise
                    const items = this.state.setlist.items;                 // Get the items from the setlist
                    const setlistTitle = this.state.setlist.title;          // Get the items from the setlist
                    const dateString = new Date().toLocaleDateString();     // Get date string
                    
                    // Get what instruments are in the setlist and open a dialog
                    // so that the user can choose to download only the sheets 
                    // for one instriment, or the entire list.
                    await new Promise(async (resolve) => {
                        for(const item of items) {
                            if(item.type == 'score') {
                                await item.scoreRef.collection('parts').get().then(async function(querySnapshot) {
                                    for (const part of querySnapshot.docs) {

                                        //Get the name of the instrument in an array, for future filtering
                                        await part.data().instrumentRef.get().then(function(ref) {
                                            instrArr.push(ref.get("name"));
                                        });
                                    }
                                });
                            }
                        } 
                        resolve();
                    }).then(async function() {
                        st = await thiss.downloadDialog.open(instrArr);    // Open the download dialog, returns the state from it
                        if(st.instrument.value) {
                            selectedInstrument = st.instrument.value;          // Get the instrument that was selected from the dialog
                        } else {
                            selectedInstrument = "Events";
                        }
                    });
                    
                    var array = []; //Promise array to make sure everything is in the right order
                    var instrumentPromiseArray = [];
                    var overview = [];  // To make the overview
                    var overviewIndex = 0;

                    items.forEach((item) => {
                        switch(item.type) {
                            case('event'):
                                overview.push({ title: item.title, page: 0, type: item.type })
                                array.push(new Promise(resolve => {
                                    resolve([[item.title, item.description, item.time]]);
                                }));
                                break;

                            case('score'):
                                for(let i = 0; i < item.score.partCount; i++) {
                                    overview.push({ title: item.score.title, page: 0, type: item.type })
                                }
                                
                                array.push(new Promise(resolve => {
                                    item.scoreRef.collection('parts').get().then(async function(querySnapshot) {
                                        
                                        let ar = [];
                                        let arOfAr = [];

                                        // Iterate through parts
                                        for (const part of querySnapshot.docs) {

                                            //Get the name of the instrument in an array, for future filtering
                                            instrumentPromiseArray.push(new Promise(resolve => {
                                                part.data().instrumentRef.get().then(function(ref) {
                                                    resolve(ref.get("name"));
                                                });
                                            }));

                                            // Get the images of pages in the part
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
                        Promise.all(instrumentPromiseArray).then(function(instrumentArray) {
                            let instIndex = 0;
                            overview.forEach(item => { //Add instrument to overview
                                if(item.type == 'score') {
                                    item.title += " (" + instrumentArray[instIndex++] + ")";
                                }
                            });

                            const doc = new jsPDF('p', 'px', 'a4'); // Make PDF
                            const size_increase = 1.33334;   // jsPDF doesn't agree with itself on some sizes, no idea why
                            const titleSize = 26;            // Title text size
                            const normalSize = 12;           // Normal text size
                            const linelen = 80;              // In characters
                            const leftmargin = 70;           // In pixels
                            const bottommargin = 550;        // In pixesl, from top
                            const descspace = 80;            // How much space there is between the top of the page and the description, in pixels
                            const pageNumberY = 612;         // How far down on the page the page numbe is placed, in pixesl
                            let pageNumber = 1;              // Page counter for correct page numbering
                            let pageDict = {};
                            let totalPartIndex = 0;          // Counter for parts processed, for later indexing
                            let scoreIndex = 0;
                            const dy = 12;                   // Line space in pixels
                            const a4_size = [595.28, 841.89];// For convenience, specific numbers was found in jsPDF source code
                            doc.setFont('Times');            // Set the fotn, for a list of fonts, do doc.getFontList()
                            doc.setFontSize(normalSize);     // Set textsize
                            doc.text(`Page: ${pageNumber++}`, leftmargin, pageNumberY);


                            values.forEach(array => {
                                array.forEach(items => {

                                    //Item is part (is array of pages in said part)
                                    if(items[0].startsWith("data:image/png;base64,")) {

                                        // Fix correct page number for the overview
                                        overview[overviewIndex++].page = pageNumber;
                                        
                                        // Check if part is of instrument that should be included in PDF
                                        if(selectedInstrument == instrumentArray[totalPartIndex] ||
                                           selectedInstrument == "Everything") { 
                                            // pageDict[pageNumber] = scoreArray[scoreIndex++];
                                            items.forEach(item => {
                                                doc.addPage();
                                                doc.addImage(item, 'PNG', 0, 0, a4_size[0]/size_increase, a4_size[1]/size_increase);
                                                doc.text(`${dateString}     ${setlist.title}     Downloaded by: ${band.name}     Page: ${pageNumber++}`, 20, 625);
                                            });
                                        }
                                        totalPartIndex++;
                                    } 

                                    //Item is event
                                    else { 
                                        // Fix correct page number for the overview
                                        overview[overviewIndex++].page = pageNumber;

                                        doc.addPage();
                                        doc.text(`Page: ${pageNumber++}`, leftmargin, pageNumberY);

                                        let y = descspace;
                                        
                                        var desc = items[1];

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

                                            if(y > bottommargin) {
                                                y = descspace;
                                                doc.addPage();
                                                doc.text(`Page: ${pageNumber++}`, leftmargin, pageNumberY);
                                            }
                                        }

                                        //Time
                                        doc.text(items[2] + " minutes", leftmargin, 600);
                                    }       
                                });
                            });

                            //Overview creation
                            let y = descspace
                            doc.setPage(1)
                            doc.setFontSize(titleSize);
                            doc.text(setlistTitle, leftmargin, 50); 
                            doc.setFontSize(normalSize);
                            overview.forEach(item => {
                                switch(item.type) {
                                    case('event'):
                                        doc.text(item.title + " - " + item.page, leftmargin, y);
                                        y += dy;
                                        break;

                                    case('score'):
                                        let currentInstrument = item.title.split("(")[1].split(")")[0];
                                        if(selectedInstrument == currentInstrument ||
                                           selectedInstrument == "Everything") { 
                                            doc.text(item.title + " - " + item.page, leftmargin, y);
                                            y += dy;
                                        }
                                        break;
                                }
                            });
                            doc.save(`${setlist.title}.pdf`);
                        
                        });
                    });
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
                <DownloadSetlistDialog onRef={ref => this.downloadDialog = ref} />
                <AddSetlistScoresDialog band={band} onRef={ref => this.addScoreDialog = ref} />
                <AddSetlistEventDialog onRef={ref => this.addEventDialog = ref} />
                <EditSetlistDialog onRef={ref => this.editSetlistDialog = ref} />
            </div>
        );
    }
}


export default withStyles(styles)(Setlist);