import React, {Component} from 'react';
import {
    AppBar, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Slide, Snackbar, TextField,
    Toolbar,
    Typography
} from "material-ui";

import {withStyles} from "material-ui/styles";

import AssistantIcon from 'material-ui-icons/Assistant';
import AddIcon from 'material-ui-icons/Add';
import CloseIcon from 'material-ui-icons/Close';
import Selectable from "./Selectable";
import FormDialog from "./FormDialog";

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
        margin: '0 auto'
    },

    selectable: {
        height: 150,
        marginBottom: 20
    },

    content: {
        paddingTop: 64,
        height: 'calc(100% - 64px)',
        overflowY: 'auto'
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
        instruments: []
    };

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
        let instruments = [...this.state.instruments];

        let {Name} = await this.nameDialog.open();

        instruments.push({name: Name, pages: selectedPages});

        this.setState({instruments: instruments, pages: this.state.pages.map(page => ({...page, selected: false}))});
    }

    render() {
        const {classes} = this.props;
        const {pages, instruments} = this.state;

        let instrumentsFlat = [].concat(...instruments.map(instrument => instrument.pages));

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
                    {pages.filter(page => !instrumentsFlat.includes(page.index)).map(page =>
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
                open={Boolean(instruments.length)}
                message={instruments.map((instrument, index) => <Chip className={classes.chip} key={index} label={instrument.name}/>)}
                action={<Button color="primary">Upload</Button>}
            />
            <input
                ref={input => this.fileBrowser = input}
                type='file'
                style={{display: 'none'}}
                onChange={e => this._onFileChange(e)}
            />
            <FormDialog title='Create instrument' onRef={ref => this.nameDialog = ref}>
                <TextField label="Name" margin="normal"/>
            </FormDialog>
        </Dialog>;
    }
}


export default withStyles(styles)(FileUploader);