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

    appBar__root: {
        boxShadow: 'none',
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

class UnsortedPDFs extends Component {
    state = {
        selectedPDFs: new Set(),
        lastClicked: null
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

    _onPDFClick = pdfId => {
        window.location.hash = `/pdf/${this.props.band.id}${pdfId}`
    };

    _onPDFSelect = index => {
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

    _onSelectionCloseClick = () => {
        this.setState({selectedPDFs: new Set()});
    };

    _onAddAsParts = async () => {
        const pdfs = Array.from(this.state.selectedPDFs).map(i => this.props.band.pdfs[i]);
        const {score, parts} = await this.addPartsDialog.open(pdfs);
        this.setState({selectedPDFs: new Set()});
        this.props.onAddParts(score, parts);
    };

    _onAddAsFullScore = async () => {
        const pdf = this.props.band.pdfs[Array.from(this.state.selectedPDFs)[0]];
        const {score, parts} = await this.addFullScoreDialog.open(pdf);
        this.setState({selectedPDFs: new Set()});
        this.props.onAddFullScore(score, parts, pdf);
    };

    render() {
        const {classes, band} = this.props;
        const {selectedPDFs} = this.state;

        return <div>
            {selectedPDFs.size > 0 &&
            <AppBar style={{zIndex: 100}} color='secondary' classes={{root: classes.appBar__root}}>
                <Toolbar>
                    <IconButton color="inherit" onClick={this._onSelectionCloseClick}>
                        <Close/>
                    </IconButton>
                    <Typography variant="title" color="inherit" className={classes.flex}>
                        {selectedPDFs.size} selected
                    </Typography>
                    {
                        selectedPDFs.size === 1 &&
                        <Button color='inherit' onClick={this._onAddAsFullScore}>Add as full score</Button>
                    }
                    <Button color='inherit' onClick={this._onAddAsParts}>Add as parts</Button>
                </Toolbar>
            </AppBar>
            }

            <div className={classes.flexWrapContainer}>
                {
                    band.pdfs && band.pdfs.map((doc, docIndex) =>
                        <Selectable
                            zoomed
                            key={doc.id}
                            classes={{root: classes.selectable}}
                            title={doc.name}
                            imageURL={doc.thumbnailURL}
                            selected={selectedPDFs.has(docIndex)}
                            onClick={e => this._onPDFClick(doc.id)}
                            onSelect={e => this._onPDFSelect(docIndex)}
                            selectMode={selectedPDFs.size > 0}
                        />
                    )
                }
            </div>
            <AddPartsDialog band={band} onRef={ref => this.addPartsDialog = ref}/>
            <AddFullScoreDialog band={band} onRef={ref => this.addFullScoreDialog = ref}/>
        </div>;
    }
}

export default withStyles(styles)(UnsortedPDFs);