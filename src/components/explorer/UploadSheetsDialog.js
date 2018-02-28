import React, {Component} from 'react';
import {
    AppBar, Button, Chip, Collapse, Dialog, Drawer, IconButton, List, ListItem, ListItemText, ListSubheader, Slide,
    Snackbar, Toolbar,
    Typography
} from "material-ui";

import {withStyles} from "material-ui/styles";

import Selectable from "../Selectable";

import firebase from 'firebase';

import {ExpandLess, ChevronRight, Add, Close, Assistant, ExpandMore} from "material-ui-icons";


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
        flexWrap: 'wrap'
    },

    selectable: {
        height: 150,
        width: 120,
        marginRight: 10,
        marginBottom: 10
    },

    content: {
        paddingTop: 64,
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        height: 'calc(100% - 64px)',
        overflowY: 'auto',
        background: '#f7f7f7'
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
        open: false
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    _onDialogClose() {
        this.setState({open: false, sheets: []});
    }

    _onSelectFileClick() {
        this.fileBrowser.click();
    }

    open() {
        return new Promise((resolve, reject) => {
            this.setState({open: true});

            this.__resolve = resolve;
            this.__reject = reject;
        });
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

                const blob = await new Promise(resolve => canvas.toBlob(blob => resolve(blob)));

                return window.URL.createObjectURL(blob)
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

    _onUploadClick() {
        this.setState({open: false});
        this.__resolve(this.state.groups);
    }

    _onListItemDrop() {

    }

    render() {
        const {classes, band} = this.props;
        const {sheets, selectedSheets, groups, open} = this.state;

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
                        Upload instruments
                    </Typography>
                    <Button color="inherit" onClick={() => this._onSelectFileClick()}>
                        browse
                    </Button>
                    <IconButton disabled={!sheets.length} color="inherit">
                        <Assistant/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="persistent"
                anchor='left'
                open={true}
                classes={{
                    paper: classes.drawer__paper,
                }}
            >
                <div className={classes.drawerContent}>
                    <ListItem button onClick={() => this.props.onAddScore()}>
                        <Add/>
                        <ListItemText inset primary='Create Score'/>
                    </ListItem>
                    <List dense>
                        {band.scores && band.scores.map((score, index) =>
                            <div key={index}>
                                <ListItem button>
                                    {!score.__in && <ExpandMore onClick={() => {score.__in = true; this.forceUpdate();}}/>}
                                    {score.__in &&  <ExpandLess onClick={() => {score.__in = false; this.forceUpdate();}}/>}
                                    <ListItemText inset primary={`${score.title} - ${score.composer}`}/>
                                    <Add onClick={() => this.props.onAddInstrument(score.id)}/>
                                </ListItem>
                                <Collapse in={score.__in} timeout="auto">
                                    <List dense disablePadding>
                                        {
                                            score.sheetMusic && score.sheetMusic.map((s, index) =>
                                                <div onDragOver={e => e.preventDefault()}
                                                     onDrop={e => this._onListItemDrop(e)}>
                                                    <ListItem key={index}>
                                                        <ListItemText inset
                                                                      primary={`${s.instrument.name} ${s.instrumentNumber > 0 ? s.instrumentNumber : ''}`}/>
                                                    </ListItem>
                                                </div>
                                            )
                                        }
                                    </List>
                                </Collapse>
                            </div>
                        )}
                    </List>
                    {/*<Droppable droppableId="droppable">*/}
                    {/*{(provided, snapshot) =>*/}
                    {/*<div ref={provided.innerRef}>*/}
                    {/*{selectedSheets.map((sheet, index) =>*/}
                    {/*<Draggable key={sheet.image} draggableId={sheet.image} index={index}>*/}
                    {/*{(provided, snapshot) =>*/}
                    {/*<div>*/}
                    {/*<div*/}
                    {/*ref={provided.innerRef}*/}
                    {/*{...provided.draggableProps}*/}
                    {/*{...provided.dragHandleProps}*/}
                    {/*>*/}
                    {/*<div style={{*/}
                    {/*width: '100%',*/}
                    {/*height: 100,*/}
                    {/*backgroundImage: `url(${sheet.image})`,*/}
                    {/*backgroundSize: '100% auto'*/}
                    {/*}}/>*/}
                    {/*</div>*/}
                    {/*{provided.placeholder}*/}
                    {/*</div>*/}
                    {/*}*/}
                    {/*</Draggable>*/}
                    {/*)}*/}
                    {/*</div>*/}
                    {/*}*/}
                    {/*</Droppable>*/}
                </div>
            </Drawer>
            <div className={classes.content}>
                <div className={classes.sheetContainer}>

                    <div draggable style={{width: 100, height: 100, background: 'black'}}>
                        LOOOL
                    </div>

                    {sheets.filter(sheet => !groupsFlat.includes(sheet.index)).map(sheet =>
                        <Selectable
                            classes={{root: classes.selectable}}
                            key={sheet.index}
                            imageURL={sheet.image}
                            selected={sheet.selected}
                            onClick={(i => () => this._onSelectableClick(i))(sheet.index)}
                        />)}
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