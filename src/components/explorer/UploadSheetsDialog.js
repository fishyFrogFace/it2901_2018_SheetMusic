import React, {Component} from 'react';
import {
    AppBar, Button, Chip, CircularProgress, Collapse, Dialog, Drawer, IconButton, List, ListItem, ListItemText,
    ListSubheader, Paper, Slide,
    Snackbar, Toolbar,
    Typography
} from "material-ui";

import {withStyles} from "material-ui/styles";

import Selectable from "../Selectable";

import firebase from 'firebase';

import {ExpandLess, ChevronRight, Add, Close, Assistant, ExpandMore, ArrowBack} from "material-ui-icons";


const drawerWidth = 240;

const styles = {
    root: {},

    flex: {
        flex: 1
    },

    appBar: {
        zIndex: 10000,
    },

    sheetContainer: {
        display: 'flex',
        paddingTop: 10,
        paddingLeft: 10,
        flexWrap: 'wrap',
        overflowY: 'auto',
        height: 'calc(100% - 45px)',
        boxSizing: 'border-box'
    },

    selectable: {
        height: 170,
        width: 220,
        marginRight: 10,
        marginBottom: 10
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

    chip: {
        marginRight: 10,
        marginBottom: 10
    },

    drawer__paper: {
        width: drawerWidth
    },

    drawerContent: {
        paddingTop: 64,
    },

    uploadPane: {
        flex: 1,
        overflowY: 'auto',
        borderRight: '1px solid rgba(0,0,0,0.12)',
    },

    explorerPane: {
        width: '400px'
    },

    paneHeader: {
        height: 44,
        background: 'rgb(245, 245, 245)',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px'
    }

};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class UploadSheetsDialog extends Component {
    state = {
        sheets: [],
        selectedSheets: [],
        groups: [],
        instruments: [],
        selectedScore: null,
        selectedInstrument: null
    };

    _onDialogClose() {
        this.setState({sheets: []});
        this.props.onClose();
    }

    _onSelectFileClick() {
        this.fileBrowser.click();
    }

    async _onFileChange(e) {
        // https://reactjs.org/docs/events.html#event-pooling
        e.persist();

        if (!e.target.files.length) return;

        const PDFJS = await import('pdfjs-dist');

        let reader = new FileReader();

        reader.addEventListener('load', async () => {
            let pdf = await PDFJS.getDocument(new Uint8Array(reader.result));

            let images = await Promise.all([...Array(pdf.numPages).keys()].map(async n => {
                let page = await pdf.getPage(n + 1);

                let viewport = page.getViewport(2);

                let canvas = document.createElement("canvas");
                let context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                let task = page.render({canvasContext: context, viewport: viewport});

                await task.promise;

                return canvas.toDataURL();
            }));


            this.setState({sheets: images.map((image, index) => ({image: image, selected: false, index: index}))});
        });

        reader.readAsArrayBuffer(e.target.files[0]);
    }

    _onSelectableClick(index) {
        let sheets = [...this.state.sheets];
        sheets[index].selected = !sheets[index].selected;
        this.setState({sheets: sheets, selectedSheets: sheets.filter(sheet => sheet.selected)});
    }

    _onSelectionClose() {
        this.setState({sheets: this.state.sheets.map(sheet => ({...sheet, selected: false}))});
    }

    _onScoreClick(score) {
        this.setState({selectedScore: score});
    }

    _onArrowBackClick = () => {
        this.setState({selectedScore: null});
    };

    _onDragStart(e) {
        const image = new Image();
        e.dataTransfer.setDragImage(image, 0, 0);
    }

    _onListItemDrop = (e, sheetMusic) => {
        this.props.onUploadSheets(
            this.state.selectedScore.id,
            sheetMusic.id,
            this.state.selectedSheets.map(sheet => sheet.image));
    };

    render() {
        const {classes, band, open} = this.props;
        const {
            sheets, selectedSheets, groups,
            selectedScore, selectedInstrument,
        } = this.state;

        let groupsFlat = [].concat(...groups.map(group => group.sheets.map(sheet => sheet.index)));

        return <Dialog
            fullScreen
            open={open}
            onClose={() => this._onDialogClose()}
            transition={Transition}
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
                    <div className={classes.uploadPane}>
                        <div className={classes.paneHeader}>
                            <Typography variant='body1'>
                                Unsorted Sheets
                            </Typography>
                            <div className={classes.flex}/>
                        </div>
                        <div className={classes.sheetContainer}>
                            {sheets.filter(sheet => !groupsFlat.includes(sheet.index)).map(sheet =>
                                <Selectable
                                    onDragStart={e => this._onDragStart(e)}
                                    classes={{root: classes.selectable}}
                                    key={sheet.index}
                                    imageURL={sheet.image}
                                    selected={sheet.selected}
                                    onClick={() => this._onSelectableClick(sheet.index)}
                                />)}
                        </div>
                    </div>
                    <div className={classes.explorerPane}>
                        <div className={classes.paneHeader}>
                            {
                                selectedScore &&
                                <IconButton style={{marginLeft: -20}} onClick={this._onArrowBackClick}>
                                    <ArrowBack/>
                                </IconButton>
                            }

                            <Typography variant='body1'>
                                {
                                    !selectedScore && 'Scores'
                                }
                                {
                                    selectedScore && selectedScore.title
                                }
                            </Typography>
                            <div className={classes.flex}/>
                        </div>
                        <div style={{borderBottom: '1px solid rgba(0,0,0,0.12)'}}>
                            {
                                !selectedScore &&
                                <Button fullWidth color='primary' onClick={() => this.props.onAddScore()}>
                                    ADD SCORE
                                </Button>
                            }
                            {
                                selectedScore &&
                                <Button fullWidth color='primary'
                                        onClick={() => this.props.onAddInstrument(selectedScore.id)}>
                                    ADD INSTRUMENTS
                                </Button>
                            }
                        </div>

                        {
                            !selectedScore && !selectedInstrument &&
                            <List>
                                {band.scores && band.scores.map((score, index) =>
                                    <ListItem key={index} button onClick={() => this._onScoreClick(score)}>
                                        <ListItemText primary={`${score.title} - ${score.composer}`}/>
                                    </ListItem>
                                )}
                            </List>
                        }

                        {
                            selectedScore && !selectedInstrument &&
                            <List>
                                {selectedScore.sheetMusic && selectedScore.sheetMusic.map((s, index) =>
                                    <div
                                        key={index}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => this._onListItemDrop(e, s)}
                                    >
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={`${s.instrument.name} ${s.instrumentNumber > 0 ? s.instrumentNumber : ''}`}/>
                                            {s.uploading && <CircularProgress size={24}/>}
                                        </ListItem>
                                    </div>
                                )}
                            </List>
                        }

                        {
                            selectedScore && selectedInstrument && selectedInstrument.sheets.map((sheet, index) =>
                                <div key={index} style={{
                                    width: '100%',
                                    height: 100,
                                    backgroundImage: `url(${sheet.image})`,
                                    backgroundSize: '100% auto'
                                }}/>
                            )
                        }
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