import React, {Component} from 'react';
import {
    AppBar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, MenuItem, Select, Slide,
    Snackbar,
    TextField,
    Toolbar,
    Typography
} from "material-ui";

import {withStyles} from "material-ui/styles";

import AssistantIcon from 'material-ui-icons/Assistant';
import AddIcon from 'material-ui-icons/Add';
import CloseIcon from 'material-ui-icons/Close';
import Selectable from "./Selectable";
import FormDialog from "./FormDialog";

import firebase from 'firebase';

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

class FileUploader extends Component {
    state = {
        pages: [],
        groups: [],
        instruments: [],
        selectedInstrument: 0
    };

    async componentWillMount() {
        let snapshot = await firebase.firestore().collection('instruments').get();
        let instruments = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        this.setState({instruments: instruments});
    }

    _onDialogClose() {
        this.setState({pages: []});
        this.props.onClose();
    }

    _onSelectFileClick() {
        this.fileBrowser.click();
    }

    async _onFileChange(e) {
        // https://reactjs.org/docs/events.html#event-pooling
        e.persist();

        if  (!e.target.files.length) return;

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

            this.setState({pages: images.map((image, index) => ({image: image, selected: false, index: index}))});
        });

        reader.readAsArrayBuffer(e.target.files[0]);
    }

    _onSelectableClick(index) {
        let pages = [...this.state.pages];
        pages[index].selected = !pages[index].selected;
        this.setState({pages: pages});
    }

    _onSelectionClose() {
        this.setState({pages: this.state.pages.map(page => ({...page, selected: false}))});
    }

    async _onAddInstrument() {
        let selectedPages = this.state.pages.filter(page => page.selected).map(page => page.index);
        let groups = [...this.state.groups];

        let {instrument} = await this.instrumentDialog.open();

        groups.push({instrument: this.state.instruments[instrument], pages: selectedPages});

        this.setState({groups: groups, pages: this.state.pages.map(page => ({...page, selected: false}))});
    }

    _onInstrumentChange(e) {
        this.setState({selectedInstrument: e.target.value})
    }

    _onUploadClick() {
        let instrumentData = this.state.groups.map(group => ({
            id: group.instrument.id,
            sheets: group.pages.map(page => this.state.pages[page].image)
        }));

        this.props.onUpload(instrumentData);
    }

    render() {
        const {classes} = this.props;
        const {pages, groups, instruments, selectedInstrument} = this.state;

        let groupsFlat = [].concat(...groups.map(group => group.pages));

        return <Dialog
            fullScreen
            open={this.props.open}
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
                    <IconButton disabled={!pages.length} color="inherit">
                        <AssistantIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            {
                pages.filter(page => page.selected).length > 0 ?
                    <AppBar className={classes.appBar}>
                        <Toolbar>
                            <IconButton color="inherit" onClick={() => this._onSelectionClose()}>
                                <CloseIcon/>
                            </IconButton>
                            <Typography variant="title" color="inherit" className={classes.flex}>
                                {pages.filter(page => page.selected).length} selected
                            </Typography>
                            <IconButton color="inherit" onClick={() => this._onAddInstrument()}>
                                <AddIcon/>
                            </IconButton>
                        </Toolbar>
                    </AppBar> : ''
            }

            <div className={classes.content}>
                <div className={classes.sheetContainer}>
                    {pages.filter(page => !groupsFlat.includes(page.index)).map(page =>
                        <Selectable
                            classes={{root: classes.selectable}}
                            key={page.index}
                            imageURL={page.image}
                            selected={page.selected}
                            onClick={(i => () => this._onSelectableClick(i))(page.index)}
                        />)}
                </div>
            </div>
            <Snackbar
                anchorOrigin={{vertical: 'bottom', horizontal: 'right',}}
                open={Boolean(groups.length)}
                message={groups.map((group, index) => <Chip className={classes.chip} key={index} label={group.instrument.name}/>)}
                action={<Button color="primary" onClick={() => this._onUploadClick()}>Upload</Button>}
            />
            <input
                ref={input => this.fileBrowser = input}
                type='file'
                style={{display: 'none'}}
                onChange={e => this._onFileChange(e)}
            />
            <FormDialog title='Create instrument' onRef={ref => this.instrumentDialog = ref}>
                <Select
                    name='instrument'
                    value={selectedInstrument}
                    onChange={e => this._onInstrumentChange(e)}
                >
                    {instruments.map((instrument, index) => <MenuItem key={index} value={index}>{instrument.name}</MenuItem>)}
                </Select>
            </FormDialog>
        </Dialog>;
    }
}

export default withStyles(styles)(FileUploader);