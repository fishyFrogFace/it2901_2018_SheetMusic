import React, {Component} from 'react';
import {AppBar, Button, IconButton, Slide, Toolbar, Typography} from "material-ui";

import {withStyles} from "material-ui/styles";

import {Close, ArrowBack} from "material-ui-icons";
import Selectable from "../../components/Selectable";
import AddPartsDialog from "../../components/dialogs/AddPartsDialog";
import AddFullScoreDialog from "../../components/dialogs/AddFullScoreDialog";
import AddPartDialog from "../../components/dialogs/AddPartDialog";


const drawerWidth = 240;

const styles = {
    root: {},

    flex: {
        flex: 1
    },

    appBar: {
        zIndex: 10000,
    },

    selectable1: {
        height: 250,
        width: 250,
        marginRight: 20,
        marginBottom: 20
    },

    selectable2: {
        width: '100%',
        height: 200,
        marginBottom: 20,
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
    },

    appBar__root: {
        boxShadow: 'none',
    }
};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class UnsortedPDFs extends Component {
    state = {
        selectedItems: new Set(),
        lastClicked: null,
        anchorEl: null,
        selectedPDF: null
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
        this.setState({selectedItems: new Set()});
        this.props.onClose();
    };

    _onSelectFileClick() {
        this.fileBrowser.click();
    }

    _onPDFClick = index => {
        this.setState({selectedPDF: index});
    };

    _onItemSelect = index => {
        const selectedItems = new Set(this.state.selectedItems);

        if (this.keys.ShiftLeft && this.state.lastClicked !== null) {
            let indices = [];
            for (let i = Math.min(this.state.lastClicked, index); i <= Math.max(this.state.lastClicked, index); i++) {
                indices.push(i);
            }

            for (let i of indices) {
                selectedItems.add(i);
            }
        } else {
            if (selectedItems.has(index)) {
                selectedItems.delete(index);
            } else {
                selectedItems.add(index);
            }
        }

        this.setState({selectedItems: selectedItems, lastClicked: index});
    };

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

    _onMenuClick = () => {
        this.setState({anchorEl: null});
    };

    _onMenuClose = () => {
        this.setState({anchorEl: null});
    };

    _onSelectionCloseClick = () => {
        this.setState({selectedItems: new Set()});
    };

    _onAddAsParts = async () => {
        const pdfs = Array.from(this.state.selectedItems).map(i => this.props.band.pdfs[i]);
        this.setState({selectedItems: new Set()});
        const {score, parts} = await this.addPartsDialog.open(pdfs);
        this.props.onAddParts(score, parts);
    };

    _onAddAsFullScore = async () => {
        const pdf = this.props.band.pdfs[Array.from(this.state.selectedItems)[0]];
        this.setState({selectedItems: new Set()});
        const {score, parts} = await this.addFullScoreDialog.open(pdf);
        this.props.onAddFullScore(score, parts);
    };

    _onAddAsPart = async () => {
        const pages = Array.from(this.state.selectedItems);
        this.setState({selectedItems: new Set()});
        const {score, part} = await this.addPartDialog.open();

        const pdf = this.props.band.pdfs[this.state.selectedPDF];

        part.pagesCropped = pages.map(page => pdf.pagesCropped[page]);
        part.pagesOriginal = pages.map(page => pdf.pagesOriginal[page]);

        this.props.onAddPart(score, part);
    };

    render() {
        const {classes, band} = this.props;
        const {selectedPDF, selectedItems} = this.state;

        return <div>
            {selectedItems.size > 0 &&
            <AppBar className={classes.appBar} color='secondary' classes={{root: classes.appBar__root}}>
                <Toolbar>
                    <IconButton color="inherit" onClick={this._onSelectionCloseClick}>
                        <Close/>
                    </IconButton>
                    <Typography variant="title" color="inherit" className={classes.flex}>
                        {selectedItems.size} selected
                    </Typography>
                    {selectedPDF === null && selectedItems.size === 1 &&
                    <Button color='inherit' onClick={this._onAddAsFullScore}>Add as full score</Button>}
                    {selectedPDF === null &&
                    <Button color='inherit' onClick={this._onAddAsParts}>Add as parts</Button>}
                    {selectedPDF !== null &&
                    <Button color='inherit' onClick={this._onAddAsPart}>Add as part</Button>}
                </Toolbar>
            </AppBar>
            }

            {
                selectedPDF !== null &&
                <div style={{display: 'flex', height: 40, alignItems: 'center', marginTop: 20}}>
                    <IconButton onClick={() => this.setState({
                        selectedPDF: null,
                        selectedItems: new Set()
                    })}><ArrowBack/></IconButton>
                    <Typography variant='subheading'>{band.pdfs[selectedPDF].name}</Typography>
                </div>
            }

            <div className={classes.flexWrapContainer}>
                {
                    selectedPDF === null && band.pdfs && band.pdfs.map((doc, docIndex) =>
                        <Selectable
                            zoomed
                            key={doc.id}
                            classes={{root: classes.selectable1}}
                            title={doc.name}
                            imageURL={doc.pagesCropped ? doc.pagesCropped[0] : ''}
                            selected={selectedItems.has(docIndex)}
                            onClick={e => this._onPDFClick(docIndex)}
                            onSelect={e => this._onItemSelect(docIndex)}
                            selectMode={selectedItems.size > 0}
                        />
                    )
                }
            </div>
            <div style={{padding: '0 20px'}}>
                {
                    selectedPDF !== null && band.pdfs[selectedPDF].pagesCropped.map((page, index) =>
                        <Selectable
                            key={index}
                            classes={{root: classes.selectable2}}
                            selected={selectedItems.has(index)}
                            imageURL={page}
                            onClick={e => {
                            }}
                            onSelect={e => this._onItemSelect(index)}
                            selectMode={true}
                        />
                    )}
            </div>
            <AddPartDialog band={band} onRef={ref => this.addPartDialog = ref}/>
            <AddPartsDialog band={band} onRef={ref => this.addPartsDialog = ref}/>
            <AddFullScoreDialog band={band} onRef={ref => this.addFullScoreDialog = ref}/>
        </div>;
    }
}

export default withStyles(styles)(UnsortedPDFs);