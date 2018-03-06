import React, {Component} from 'react';
import {
    AppBar, Button, CircularProgress, Dialog, IconButton,
    List, ListItem, ListItemText, Menu, MenuItem, Paper, Slide, Toolbar, Typography
} from "material-ui";

import {withStyles} from "material-ui/styles";

import {
    ExpandLess, ChevronRight, Add, Close, Assistant, ExpandMore, ArrowBack, Home, Remove,
    Delete
} from "material-ui-icons";
import DraggableImage from './DraggableImage'
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import Selectable from "./Selectable";


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
        height: 250,
        width: 250,
        marginRight: 20,
        marginBottom: 20
    },

    content: {
        paddingTop: 64,
        height: '100%',
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
        borderRight: '1px solid rgba(0,0,0,0.12)'
    },

    explorerPane: {
        width: '400px',
        height: '100%'
    },

    flexWrapContainer: {
        display: 'flex',
        paddingTop: 20,
        paddingLeft: 20,
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
    },

    selectionToolbar: {
        position: 'absolute',
        top: 0,
        left: 0
    }
};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class UploadSheetsDialog extends Component {
    state = {
        selectedPDFs: new Set(),
        selectedScoreId: null,
        selectedSheetMusicId: null,
        lastClicked: null,
        entered: false,
        anchorEl: null,
        selectMode: false
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

    _onDialogClose = () => {
        this.setState({selectedPDFs: new Set()});
        this.props.onClose();
    };

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

    _onSelectableSelect = (e, index) => {
        const selectedPDFs = new Set(this.state.selectedPDFs);

        if (this.keys.ShiftLeft && this.state.lastClicked !== null) {
            let indices = [];
            for (let i = Math.min(this.state.lastClicked, index); i <= Math.max(this.state.lastClicked, index); i++) {
                indices.push(i);
            }

            for (let i of indices) {
                selectedPDFs.add(i);
            }
        } else {
            if (selectedPDFs.has(index)) {
                selectedPDFs.delete(index);
            } else {
                selectedPDFs.add(index);
            }
        }

        this.setState({selectedPDFs: selectedPDFs, lastClicked: index});
    };

    _onSelectableClick = (e, index) => {

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

    _onAddButtonClick = e => {
        this.setState({anchorEl: e.currentTarget});
    };


    _onUploadPaneClick = () => {
        // const selectedSheets = {...this.state.selectedSheets};
        //
        // for (let key of Object.keys(selectedSheets)) {
        //     selectedSheets[key] = false;
        // }
        //
        // this.setState({selectedPDFs: selectedPDFs});
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

    _onMenuClick = () => {
        this.setState({anchorEl: null});
    };

    _onMenuClose = () => {
        this.setState({anchorEl: null});
    };

    _onSelectionCloseClick = () => {
        this.setState({selectedPDFs: new Set()});
    };

    render() {
        const {classes, band, open} = this.props;
        const {selectedPDFs, selectedScoreId, selectedSheetMusicId, entered, selectMode} = this.state;

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
            {selectedPDFs.size > 0 ?
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton color="inherit" onClick={this._onSelectionCloseClick}>
                            <Close/>
                        </IconButton>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            {selectedPDFs.size} selected
                        </Typography>
                        <Button color='inherit'>Add to score</Button>
                    </Toolbar>
                </AppBar> :
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton color="inherit" onClick={this._onDialogClose}>
                            <Close/>
                        </IconButton>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            Unsorted PDF
                        </Typography>
                        <Button color='inherit'>Select</Button>
                    </Toolbar>
                </AppBar>
            }
            <div className={classes.content}>
                <div className={classes.flexWrapContainer}>
                    {entered && band.pdfs && band.pdfs.map((doc, docIndex) =>
                        <Selectable
                            key={doc.id}
                            classes={{root: classes.selectable}}
                            title={doc.name + '.pdf'}
                            imageURL={doc.pages[0]}
                            selected={selectedPDFs.has(docIndex)}
                            onClick={e => this._onSelectableClick(e, docIndex)}
                            onSelect={e => this._onSelectableSelect(e, docIndex)}
                            selectMode={selectedPDFs.size > 0}
                        />
                    )}
                </div>
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