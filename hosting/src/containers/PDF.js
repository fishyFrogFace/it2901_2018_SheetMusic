import React from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {Button, IconButton, Menu, MenuItem, Select, Snackbar} from "material-ui";
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import MoreVertIcon from 'material-ui-icons/MoreVert';

import firebase from 'firebase';
import 'firebase/storage';

import {Close, FileDownload} from "material-ui-icons";
import Selectable from "../components/Selectable";
import AddPartDialog from "../components/dialogs/AddPartDialog";

const styles = {
    root: {},

    flex: {
        flex: 1
    },

    appBar__root: {
        boxShadow: 'none',
    },

    selectable: {
        height: 400,
        width: '100%',
        marginBottom: 20
    },

    flexWrapContainer: {
        display: 'flex',
        paddingTop: 64 + 20,
        paddingLeft: 20,
        paddingRight: 20,
        flexWrap: 'wrap',
        boxSizing: 'border-box',
        alignContent: 'flex-start'
    },
};

class PDF extends React.Component {
    state = {
        selectedPages: new Set(),
        message: null
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

    _onArrowBackButtonClick = () => {
        window.location.hash = '/pdfs';
    };

    _onPageSelect = index => {
        const selectedPages = new Set(this.state.selectedPages);

        if (this.keys.ShiftLeft && this.state.lastClicked !== null) {
            let indices = [];
            for (let i = Math.min(this.state.lastClicked, index); i <= Math.max(this.state.lastClicked, index); i++) {
                indices.push(i);
            }

            for (let i of indices) {
                selectedPages.add(i);
            }
        } else {
            if (selectedPages.has(index)) {
                selectedPages.delete(index);
            } else {
                selectedPages.add(index);
            }
        }

        this.setState({selectedPages: selectedPages, lastClicked: index});
    };

    _onAddAsPart = async () => {
        const selectedPages = Array.from(this.state.selectedPages);
        const {score, part} = await this.addPartDialog.open();

        const {band, pdf} = this.props;

        let scoreRef;
        if (score.id) {
            scoreRef = firebase.firestore().doc(`bands/${band.id}/scores/${score.id}`);
        } else {
            scoreRef = await firebase.firestore().collection(`bands/${band.id}/scores`).add({
                title: score.title || 'Untitled Score',
                composer: score.composer || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
        }

        await scoreRef.collection('parts').add({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            instrumentRef: firebase.firestore().doc(`instruments/${part.instrumentId}`),
            instrumentNumber: part.instrumentNumber,
            pages: selectedPages.map(page => ({
                croppedURL: pdf.pages[page].croppedURL,
                originalURL: pdf.pages[page].originalURL
            }))
        });

        const notSelectedPages = pdf.pages.filter((_, index) => !selectedPages.includes(index));

        await firebase.firestore().doc(`bands/${band.id}/pdfs/${pdf.id}`).update({
           pages: notSelectedPages
        });

        this.setState({message: 'Part added', selectedPages: new Set()});
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.setState({message: null});
    };

    _onSelectionCloseClick = () => {
        this.setState({selectedPages: new Set()});
    };

    render() {
        const {classes, pdf, band} = this.props;
        const {selectedPages, message} = this.state;

        const hasPages = Boolean(pdf.pages && pdf.pages.length);

        return (
            <div className={classes.root}>
                <AppBar style={{zIndex: 10}}>
                    <Toolbar>
                        <IconButton color="inherit" onClick={() => this._onArrowBackButtonClick()}>
                            <ArrowBackIcon/>
                        </IconButton>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            {pdf.name}
                        </Typography>
                    </Toolbar>
                </AppBar>

                {
                    selectedPages.size > 0 &&
                    <AppBar style={{zIndex: 100}} color='secondary' classes={{root: classes.appBar__root}}>
                        <Toolbar>
                            <IconButton color="inherit" onClick={this._onSelectionCloseClick}>
                                <Close/>
                            </IconButton>
                            <Typography variant="title" color="inherit" className={classes.flex}>
                                {selectedPages.size} selected
                            </Typography>
                            <Button color='inherit' onClick={this._onAddAsPart}>Add as part</Button>
                        </Toolbar>
                    </AppBar>
                }

                <div className={classes.flexWrapContainer}>
                    {
                        hasPages && pdf.pages.map((page, index) =>
                            <Selectable
                                key={index}
                                classes={{root: classes.selectable}}
                                selected={selectedPages.has(index)}
                                imageURL={page.originalURL}
                                onClick={e => {}}
                                onSelect={e => this._onPageSelect(index)}
                                selectMode={true}
                            />
                        )}
                </div>
                <AddPartDialog band={band} onRef={ref => this.addPartDialog = ref}/>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    open={Boolean(message)}
                    message={message}
                />
            </div>
        );
    }
}


export default withStyles(styles)(PDF);