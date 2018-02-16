import React, {Component} from 'react';
import {
    AppBar, Button, Dialog, IconButton, Slide, Toolbar,
    Typography
} from "material-ui";

import AssistantIcon from 'material-ui-icons/Assistant';
import AddIcon from 'material-ui-icons/Add';
import CloseIcon from 'material-ui-icons/Close';
import {withStyles} from "material-ui/styles";
import Selectable from "./Selectable";

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

    grid: {
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
    }
};

function Transition(props) {
    return <Slide direction="up" {...props} />;
}

class FileUploader extends Component {
    state = {
        pages: []
    };

    _onDialogClose() {
        this.setState({images: []});
        this.props.onClose();
    }

    _onSelectFileClick() {
        this.fileBrowser.click();
    }

    async _onFileChange(e) {
        // https://reactjs.org/docs/events.html#event-pooling
        e.persist();

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

            this.setState({pages: images.map(image => ({image: image, selected: false}))});
        });

        reader.readAsArrayBuffer(e.target.files[0]);
    }

    _onSelectableClick(index) {
        let pages = [...this.state.pages];
        pages[index].selected = !pages[index].selected;
        this.setState({pages: pages});
    }

    render() {
        const {classes} = this.props;
        const {pages} = this.state;

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
                        Sound
                    </Typography>
                    <Button color="inherit" onClick={() => this._onSelectFileClick()}>
                        select file
                    </Button>
                    {/*<IconButton color="inherit" onClick={e => this._onFileUploadButtonClick(e)}>*/}
                    {/*<AssistantIcon/>*/}
                    {/*</IconButton>*/}
                    {/*<Button color="inherit" onClick={() => this._onDialogClose()}>*/}
                    {/*save*/}
                    {/*</Button>*/}
                </Toolbar>
            </AppBar>
            {/*{*/}
                {/*selectedPages.size > 0 ?*/}
                    {/*<AppBar className={classes.appBar}>*/}
                        {/*<Toolbar>*/}
                            {/*<IconButton color="inherit" onClick={() => this._onDialogClose()}>*/}
                                {/*<CloseIcon/>*/}
                            {/*</IconButton>*/}
                            {/*<Typography variant="title" color="inherit" className={classes.flex}>*/}
                                {/*{selectedPages.size} selected*/}
                            {/*</Typography>*/}
                            {/*<IconButton color="inherit">*/}
                                {/*<AddIcon/>*/}
                            {/*</IconButton>*/}
                            {/*/!*<Button color="inherit" onClick={() => this._onDialogClose()}>*!/*/}
                            {/*/!*save*!/*/}
                            {/*/!*</Button>*!/*/}
                        {/*</Toolbar>*/}
                    {/*</AppBar> : ''*/}
            {/*}*/}

            <div className={classes.content}>
                <div className={classes.grid}>
                    {pages.map((page, index) =>
                        <Selectable
                            classes={{root: classes.selectable}}
                            key={index}
                            imageURL={page.image}
                            selected={page.selected}
                            onClick={(i => () => this._onSelectableClick(i))(index)}
                        />)}
                </div>
            </div>
            <input
                ref={input => this.fileBrowser = input}
                type='file'
                style={{display: 'none'}}
                onChange={e => this._onFileChange(e)}/>
        </Dialog>;


    }
}


export default withStyles(styles)(FileUploader);