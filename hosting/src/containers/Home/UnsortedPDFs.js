import React from 'react';
import {
    AppBar, Button, Checkbox, CircularProgress, Divider, IconButton, List, ListItem, ListItemText, Paper, Toolbar,
    Typography
} from "material-ui";

import {withStyles} from "material-ui/styles";

import {Close} from "material-ui-icons";
import Selectable from "../../components/Selectable";
import AddPartsDialog from "../../components/dialogs/AddPartsDialog";
import AddFullScoreDialog from "../../components/dialogs/AddFullScoreDialog";

const styles = theme => ({
    checkbox__checked: {
        color: theme.palette.secondary.main
    },

    root: {},

    flex: {
        flex: 1
    },

    selectable__root: {
        height: 250,
        width: 250,
        marginRight: 20,
        marginBottom: 20
    },

    flexWrapContainer: {
        display: 'flex',
        paddingTop: 20,
        paddingLeft: 20,
        flexWrap: 'wrap',
        boxSizing: 'border-box',
        alignContent: 'flex-start'
    }
});

class UnsortedPDFs extends React.Component {
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

    _onPDFClick = pdfId => {
        window.location.hash = `/pdf/${this.props.band.id}${pdfId}`
    };

    _onPDFSelect = (id, checked) => {
        const selectedPDFs = new Set(this.state.selectedPDFs);

        if (this.keys.ShiftLeft && this.state.lastClicked !== null) {
            // let indices = [];
            // for (let i = Math.min(this.state.lastClicked, index); i <= Math.max(this.state.lastClicked, index); i++) {
            //     indices.push(i);
            // }
            //
            // for (let i of indices) {
            //     selectedPDFs.add(i);
            // }
        } else {
            if (checked) {
                selectedPDFs.add(id);
            } else {
                selectedPDFs.delete(id);
            }
        }

        this.props.onSelect(selectedPDFs);

        this.setState({selectedPDFs: selectedPDFs});
    };

    _onSelectionCloseClick = () => {
        this.props.onSelect(new Set());
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
            {
                selectedPDFs.size > 0 &&
                <AppBar color='secondary' classes={{root: classes.appBar__root}}>
                    <Toolbar style={{minHeight: 56}}>
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
            <div style={{paddingTop: 20, paddingLeft: 20}}>
                {
                    band.pdfs && band.pdfs.map(group => {
                        switch (group.type) {
                            case 'full':
                                return <Paper key={group.item.id} style={{marginRight: 20, marginBottom: 20}}>
                                    <ListItem key={group.item.id} style={{height: 40, padding: '10px 0'}} button disableRipple>
                                        {group.item.processing && <div style={{width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><CircularProgress color="secondary" size={20}/></div>}
                                        {
                                            !group.item.processing && <Checkbox classes={{checked: classes.checkbox__checked}} onChange={(_, checked) => this._onPDFSelect(group.item.id, checked)}/>
                                        }
                                        <ListItemText primary={group.item.name}/>
                                    </ListItem>
                                </Paper>;
                            case 'part':
                                return <Paper key={group.name} style={{marginRight: 20, marginBottom: 20}}>
                                    <div style={{padding: '10px 20px'}}>
                                        <Typography variant='body2'>{group.name}</Typography>
                                    </div>
                                    <Divider/>
                                    <List>
                                        {
                                            group.items.map(item =>
                                                <ListItem key={item.id} style={{height: 40, padding: '10px 0'}} button disableRipple>
                                                    {item.processing && <div style={{width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center'}}><CircularProgress color="secondary" size={20}/></div>}
                                                    {!item.processing && <Checkbox classes={{checked: classes.checkbox__checked}} onChange={(_, checked) => this._onPDFSelect(item.id, checked)}/>}
                                                    <ListItemText primary={item.name}/>
                                                </ListItem>
                                            )
                                        }
                                    </List>
                                </Paper>
                        }
                    })
                }
            </div>
            {/*<Typography style={{marginLeft: 20, marginTop: 20, color: 'rgba(0,0,0,.54)'}}*/}
            {/*variant='body1'>All</Typography>*/}
            {/*<div className={classes.flexWrapContainer}>*/}
            {/*{*/}
            {/*band.pdfs && band.pdfs.map((doc, docIndex) =>*/}
            {/*<Selectable*/}
            {/*zoomed*/}
            {/*key={doc.id}*/}
            {/*classes={{root: classes.selectable__root}}*/}
            {/*title={doc.name}*/}
            {/*imageURL={doc.thumbnailURL}*/}
            {/*selected={selectedPDFs.has(docIndex)}*/}
            {/*onClick={e => this._onPDFClick(doc.id)}*/}
            {/*onSelect={e => this._onPDFSelect(docIndex)}*/}
            {/*selectMode={selectedPDFs.size > 0}*/}
            {/*/>*/}
            {/*)*/}
            {/*}*/}
            {/*</div>*/}
            <AddPartsDialog band={band} onRef={ref => this.addPartsDialog = ref}/>
            <AddFullScoreDialog band={band} onRef={ref => this.addFullScoreDialog = ref}/>
        </div>;
    }
}

export default withStyles(styles)(UnsortedPDFs);