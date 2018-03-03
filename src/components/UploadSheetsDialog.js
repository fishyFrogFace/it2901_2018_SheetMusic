import React, {Component} from 'react';
import {
    AppBar, Button, CircularProgress, Dialog, IconButton,
    List, ListItem, ListItemText, Paper, Slide, Toolbar, Typography
} from "material-ui";

import {withStyles} from "material-ui/styles";

import {
    ExpandLess, ChevronRight, Add, Close, Assistant, ExpandMore, ArrowBack, Home, Remove,
    Delete
} from "material-ui-icons";
import DraggableImage from './DraggableImage'
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";


const drawerWidth = 240;

const styles = {
    root: {},

    flex: {
        flex: 1
    },

    appBar: {
        zIndex: 10000,
    },

    selectable: {
        height: 170,
        width: 220,
        marginRight: 15,
        marginBottom: 15
    },

    content: {
        paddingTop: 64 + 20,
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        height: '100%',
        background: 'rgb(250, 250, 250)',
        boxSizing: 'border-box'
    },

    paper: {
        display: 'flex',
        height: '100%'
    },

    paneHeader: {
        height: 44,
        background: 'rgb(245, 245, 245)',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px'
    },

    uploadPane: {
        flex: 1,
        height: '100%',
        borderRight: '1px solid rgba(0,0,0,0.12)',
    },

    explorerPane: {
        width: '400px',
        height: '100%'
    },

    sheetContainer: {
        display: 'flex',
        paddingTop: 15,
        paddingLeft: 15,
        flexWrap: 'wrap',
        boxSizing: 'border-box',
        alignContent: 'flex-start'
    },

    anchor: {
        textDecoration: 'underline',
        cursor: 'pointer',
        color: 'rgb(0,188,212)'
    },

    paneContent: {
        height: 'calc(100% - 45px)',
        overflowY: 'auto'
    }
};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class UploadSheetsDialog extends Component {
    state = {
        selectedSheets: {},
        selectedScoreId: null,
        selectedSheetMusicId: null,
        lastClicked: null,
        entered: false
    };

    keys = {};

    constructor(props) {
        super(props);

        window.onkeydown = e => {
            this.keys[e.code] = true;
        };

        window.onkeyup = e => {
            this.keys[e.code] = false;
        }
    }

    _onDialogClose() {
        this.setState({selectedSheets: {}});
        this.props.onClose();
    }

    _onSelectFileClick() {
        this.fileBrowser.click();
    }

    async _onFileChange(e) {
        // https://reactjs.org/docs/events.html#event-pooling
        e.persist();

        if (!e.target.files.length) return;

        let reader = new FileReader();

        reader.addEventListener('load', () => {

        });

        reader.readAsArrayBuffer(e.target.files[0]);
    }

    _onDraggableMouseDown = (e, index) => {
        const selectedSheets = {...this.state.selectedSheets};

        if (this.keys.MetaLeft) {
            selectedSheets[index] = !selectedSheets[index];
        } else if (this.keys.ShiftLeft && this.state.lastClicked !== null) {
            let indices = [];
            for (let i = Math.min(this.state.lastClicked, index); i <= Math.max(this.state.lastClicked, index); i++) {
                indices.push(i);
            }

            for (let i of indices) {
                selectedSheets[i] = true;
            }
        } else {
            if (!selectedSheets[index]) {
                for (let key of Object.keys(selectedSheets)) {
                   selectedSheets[key] = false;
                }
                selectedSheets[index] = true;
            }
        }

        this.setState({selectedSheets: selectedSheets, lastClicked: index});
    };

    _onScoreClick(score) {
        this.setState({selectedScoreId: score.id});
    }

    _onDragStart(e) {
        const image = new Image();
        e.dataTransfer.setDragImage(image, 0, 0);
    }

    _onListItemDrop = (e, sheetMusic) => {
        this.props.onUploadSheets(
            this.state.selectedScoreId,
            sheetMusic.id,
            this.state.sheets.filter(sheet => sheet.selected).map(sheet => sheet.image));
    };

    _onInstrumentClick(s) {
        this.setState({selectedSheetMusicId: s.id})
    }

    _onSheetDelete() {

    }

    _onUploadPaneClick = () => {
        const selectedSheets = {...this.state.selectedSheets};

        for (let key of Object.keys(selectedSheets)) {
            selectedSheets[key] = false;
        }

        this.setState({selectedSheets: selectedSheets});
    };

    _onBreadcrumbScoreClick = () => {
        this.setState({selectedSheetMusicId: null});
    };

    _onBreadcrumbHomeClick = () => {
        this.setState({selectedSheetMusicId: null, selectedScoreId: null});
    };

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

        const {selectedScoreId, selectedSheetMusicId} = this.state;

        const selectedScore = this.props.band.scores.find(score => score.id === selectedScoreId);
        const selectedSheetMusic = selectedScore.sheetMusic.find(s => s.id === selectedSheetMusicId);

        const sheets = reorder(
            selectedSheetMusic.sheets,
            result.source.index,
            result.destination.index
        );

        this.props.onSheetsChange(selectedScoreId, selectedSheetMusicId, sheets);
    };

    _onDialogEntered = () => {
        this.setState({entered: true});
    };

    _onDialogExiting = () => {
        this.setState({entered: false});
    };

    render() {
        const {classes, band, open} = this.props;
        const {selectedSheets, selectedScoreId, selectedSheetMusicId, entered} = this.state;

        const selectedScore = band.scores && band.scores.find(score => score.id === selectedScoreId);
        const selectedSheetMusic = selectedScore && selectedScore.sheetMusic.find(s => s.id === selectedSheetMusicId);

        return <Dialog
            fullScreen
            open={open}
            onClose={() => this._onDialogClose()}
            transition={Transition}
            onEntered={this._onDialogEntered}
            onExiting={this._onDialogExiting}
        >
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton color="inherit" onClick={() => this._onDialogClose()}>
                        <Close/>
                    </IconButton>
                    <Typography variant="title" color="inherit" className={classes.flex}>
                        Upload sheets
                    </Typography>
                    <Button color="inherit" onClick={() => this._onSelectFileClick()}>
                        Add Sheets
                    </Button>
                </Toolbar>
            </AppBar>
            <div className={classes.content}>
                <Paper className={classes.paper} elevation={1}>
                    <div className={classes.uploadPane} onClick={this._onUploadPaneClick}>
                        <div className={classes.paneHeader}>
                            <Typography variant='body1'>
                                Unsorted Sheets
                            </Typography>
                            <div className={classes.flex}/>
                            {Object.keys(selectedSheets).length && <IconButton onClick={() => this._onSheetDelete()}><Delete/></IconButton>}
                        </div>
                        <div className={classes.paneContent}>
                            {entered && band.unsortedSheets && band.unsortedSheets.map((doc, docIndex) =>
                                <div key={doc.id}>
                                    <Typography variant='body2' style={{padding: 15}}>{doc.fileName}</Typography>
                                    <div className={classes.sheetContainer}>
                                        {doc.sheets.map((sheet, sheetIndex) =>
                                            <DraggableImage
                                                onDragStart={e => this._onDragStart(e)}
                                                classes={{root: classes.selectable}}
                                                key={sheetIndex}
                                                imageURL={sheet}
                                                selected={selectedSheets[docIndex + sheetIndex]}
                                                onClick={e => e.stopPropagation()}
                                                onMouseDown={e => this._onDraggableMouseDown(e, docIndex + sheetIndex)}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={classes.explorerPane}>
                        <div className={classes.paneHeader}>
                            <Typography variant='body1'>
                                <span className={classes.anchor} onClick={this._onBreadcrumbHomeClick}>Scores</span>
                                {selectedScore && <span> › <span className={classes.anchor}
                                                                 onClick={this._onBreadcrumbScoreClick}>{selectedScore.title}</span></span>}
                                {selectedScore && selectedSheetMusic &&
                                <span> › {selectedSheetMusic.instrument.name}</span>
                                }
                            </Typography>
                            <div className={classes.flex}/>
                        </div>
                        <div className={classes.paneContent}>
                            <div style={{borderBottom: '1px solid rgba(0,0,0,0.12)'}}>
                                {
                                    !selectedScore &&
                                    <Button fullWidth color='primary' onClick={() => this.props.onAddScore()}>
                                        ADD SCORE
                                    </Button>
                                }
                                {
                                    selectedScore && !selectedSheetMusic &&
                                    <Button fullWidth color='primary'
                                            onClick={() => this.props.onAddInstrument(selectedScore.id)}>
                                        ADD INSTRUMENTS
                                    </Button>
                                }
                            </div>

                            {
                                !selectedScore && !selectedSheetMusic &&
                                <List>
                                    {band.scores && band.scores.map((score, index) =>
                                        <ListItem key={index} button onClick={() => this._onScoreClick(score)}>
                                            <ListItemText primary={`${score.title} - ${score.composer}`}/>
                                        </ListItem>
                                    )}
                                </List>
                            }

                            {
                                selectedScore && !selectedSheetMusic &&
                                <List>
                                    {selectedScore.sheetMusic && selectedScore.sheetMusic.map((s, index) =>
                                        <div
                                            key={index}
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={e => this._onListItemDrop(e, s)}
                                        >
                                            <ListItem button key={index} onClick={() => this._onInstrumentClick(s)}>
                                                <ListItemText
                                                    primary={`${s.instrument.name} ${s.instrumentNumber > 0 ? s.instrumentNumber : ''}`}/>
                                                {s.uploading && <CircularProgress size={24}/>}
                                                {!s.uploading &&
                                                <Typography
                                                    variant='body1'>{s.sheets ? s.sheets.length : 0}</Typography>}
                                            </ListItem>
                                        </div>
                                    )}
                                </List>
                            }

                            {
                                selectedScore && selectedSheetMusic &&
                                <DragDropContext onDragEnd={this._onDragEnd}>
                                    <Droppable droppableId="droppable">
                                        {(provided, snapshot) =>
                                            <div ref={provided.innerRef}>
                                                {
                                                    selectedSheetMusic.sheets.map((sheet, index) =>
                                                        <Draggable key={index} draggableId={sheet} index={index}>
                                                            {(provided, snapshot) =>
                                                                <div>
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                    >
                                                                        <div style={{
                                                                            width: '100%',
                                                                            height: 100,
                                                                            backgroundImage: `url(${sheet})`,
                                                                            backgroundSize: '100% auto'
                                                                        }}/>
                                                                    </div>
                                                                    {provided.placeholder}
                                                                </div>
                                                            }
                                                        </Draggable>
                                                    )
                                                }
                                                {provided.placeholder}
                                            </div>
                                        }
                                    </Droppable>
                                </DragDropContext>
                            }
                        </div>
                    </div>
                </Paper>
            </div>
            <input
                ref={input => this.fileBrowser = input}
                type='file'
                style={{display: 'none'}}
                onChange={e => this._onFileChange(e)}
            />
        </Dialog>;
    }
}

export default withStyles(styles)(UploadSheetsDialog);