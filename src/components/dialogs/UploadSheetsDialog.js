import React, {Component} from 'react';
import {
    AppBar, Button, Chip, Dialog, IconButton, Slide, Snackbar, Toolbar, Typography
} from "material-ui";

import {withStyles} from "material-ui/styles";

import AssistantIcon from 'material-ui-icons/Assistant';
import AddIcon from 'material-ui-icons/Add';
import CloseIcon from 'material-ui-icons/Close';
import Selectable from "../Selectable";

import firebase from 'firebase';
import AddSheetsDialog from "./AddSheetsDialog";

const styles = {
    root: {},

    appBar: {
        position: 'fixed !important',
        top: 0,
        left: 0
    },

    flex: {
        flex: 1
    },

    sheetContainer: {
        width: 700,
        margin: '0 auto',
        paddingTop: 20
    },

    selectable: {
        height: 150,
        marginBottom: 20
    },

    content: {
        paddingTop: 64,
        height: 'calc(100% - 64px)',
        overflowY: 'auto',
        background: '#f7f7f7'
    },

    chip: {
        marginRight: 10,
        marginBottom: 10
    }
};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class UploadSheetsDialog extends Component {
    state = {
        sheets: [],
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

    async componentWillMount() {
        let snapshot = await firebase.firestore().collection('instruments').get();
        let instruments = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        this.setState({instruments: instruments});
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

                return canvas.toDataURL();
            }));

            this.setState({sheets: images.map((image, index) => ({image: image, selected: false, index: index}))});
        });

        reader.readAsArrayBuffer(e.target.files[0]);
    }

    _onSelectableClick(index) {
        let sheets = [...this.state.sheets];
        sheets[index].selected = !sheets[index].selected;
        this.setState({sheets: sheets});
    }

    _onSelectionClose() {
        this.setState({sheets: this.state.sheets.map(sheet => ({...sheet, selected: false}))});
    }

    async _onAddInstrument() {
        try {
            let {instrument, instrumentNumber} = await this.addSheetsDialog.open();

            let selectedSheets = this.state.sheets.filter(sheet => sheet.selected);

            this.setState({
                groups: [...this.state.groups, {instrument: instrument, instrumentNumber: instrumentNumber, sheets: selectedSheets}],
                sheets: this.state.sheets.map(sheet => ({...sheet, selected: false})),
            });
        } catch (err) {
            console.log(err);
        }
    }

    _onUploadClick() {
        this.setState({open: false});
        this.__resolve(this.state.groups);
    }

    render() {
        const {classes} = this.props;
        const {sheets, groups, instruments, open} = this.state;

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
                        <CloseIcon/>
                    </IconButton>
                    <Typography variant="title" color="inherit" className={classes.flex}>
                        Upload instruments
                    </Typography>
                    <Button color="inherit" onClick={() => this._onSelectFileClick()}>
                        select file
                    </Button>
                    <IconButton disabled={!sheets.length} color="inherit">
                        <AssistantIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            {
                sheets.filter(sheet => sheet.selected).length > 0 ?
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton color="inherit" onClick={() => this._onSelectionClose()}>
                                <CloseIcon/>
                            </IconButton>
                            <Typography variant="title" color="inherit" className={classes.flex}>
                                {sheets.filter(sheet => sheet.selected).length} selected
                            </Typography>
                            <IconButton color="inherit" onClick={() => this._onAddInstrument()}>
                                <AddIcon/>
                            </IconButton>
                        </Toolbar>
                    </AppBar> : ''
            }

            <div className={classes.content}>
                <div className={classes.sheetContainer}>
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
            <Snackbar
                anchorOrigin={{vertical: 'bottom', horizontal: 'right',}}
                open={Boolean(groups.length)}
                message={groups.map((group, index) =>
                    <Chip
                        key={index}
                        className={classes.chip}
                        label={`${group.instrument.name} ${group.instrumentNumber > 0 ? group.instrumentNumber : ''}`}
                    />)}
                action={<Button color="primary" onClick={() => this._onUploadClick()}>Upload</Button>}
            />
            <input
                ref={input => this.fileBrowser = input}
                type='file'
                style={{display: 'none'}}
                onChange={e => this._onFileChange(e)}
            />
            <AddSheetsDialog instruments={instruments} onRef={ref => this.addSheetsDialog = ref}/>
        </Dialog>;
    }
}

export default withStyles(styles)(UploadSheetsDialog);