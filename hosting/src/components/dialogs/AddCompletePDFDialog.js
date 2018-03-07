import React from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, Input, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Step, StepLabel, Stepper, TextField,
    Typography,
    withStyles
} from "material-ui";
import AsyncDialog from "./AsyncDialog";
import {Add} from "material-ui-icons";
import Selectable from "../Selectable";

const styles = {
    selectable: {
        width: '100%',
        height: 130,
        marginBottom: 15
    }
};


class AddCompletePDF extends React.Component {
    state = {
        activeStep: 0,
        open: false,
        pdf: null,
        entered: false,
        selectedItems: new Set()
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open(pdf) {
        console.log(pdf);
        return new Promise((resolve, reject) => {
            this.setState({open: true, pdf: pdf});
            this.__resolve = resolve;
            this.__reject = reject;
        });
    }

    _onSelectChange(type, index, e) {
        const pdfData = {...this.state.pdfData};
        pdfData[index][type] = e.target.value;
        this.setState({pdfData: pdfData})
    }

    _onScoreClick(scoreId) {
        this.setState({scoreData: {id: scoreId}, activeStep: 2});
    }

    _onNewScoreClick = () => {
        this.setState({activeStep: 1});
    };

    _onNextClick = () => {
        const {activeStep, pdfData, scoreData, pdf} = this.state;
        const {band} = this.props;

        // if (this.state.activeStep === 1) {
        //     this.setState({activeStep: 2, scoreCreated: true});
        // } else {
        //     this.__resolve({
        //         score: scoreData,
        //         instruments: Object.keys(pdfData).map(i => ({
        //             pdfId: pdfs[i].id,
        //             instrumentId: band.instruments[pdfData[i].instrument].id,
        //             instrumentNumber: pdfData[i].instrumentNumber
        //         }))
        //     });
        //
        //     this.setState({
        //         open: false,
        //         activeStep: 0,
        //         scoreCreated: false,
        //         selectionData: {pdfData: pdfs.map(_ => ({instrument: 0, instrumentNumber: 0}))},
        //         scoreData: {}
        //     });
        // }
    };

    _onCancelClick = () => {
        this.__reject("Dialog canceled");
        this.setState({open: false});
    };

    _onBackClick = () => {
        if (this.state.activeStep === 1) {
            this.setState({activeStep: 0, scoreCreated: false})
        } else if (this.state.activeStep) {
            this.setState({activeStep: this.state.scoreCreated ? 1 : 0})
        }
    };

    _onDialogEntered = () => {
        this.setState({entered: true});
    };

    _onItemSelect = index => {
        const selectedItems = new Set(this.state.selectedItems);
        if (selectedItems.has(index)) {
            selectedItems.delete(index);
        } else {
            selectedItems.add(index);
        }
        this.setState({selectedItems: selectedItems});
    };

    render() {
        const {activeStep, open, pdf, entered, selectedItems} = this.state;
        const {classes} = this.props;

        if (!open) return null;


        return <Dialog open={open} onEntered={this._onDialogEntered}>
            <DialogTitle>Create score</DialogTitle>
            <DialogContent style={{display: 'flex', flexDirection: 'column', height: 500, width: 500}}>
                <Stepper activeStep={activeStep}>
                    <Step >
                        <StepLabel>Select split points</StepLabel>
                    </Step>
                    <Step >
                        <StepLabel>Select instruments</StepLabel>
                    </Step>
                </Stepper>
                <div>
                    {
                        entered && pdf && pdf.pagesCropped.map((page, index) =>
                            <Selectable
                                selected={selectedItems.has(index)}
                                classes={{root: classes.selectable}}
                                key={index}
                                imageURL={page}
                                selectMode
                                onSelect={() => this._onItemSelect(index)}
                            />
                        )
                    }
                </div>
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={this._onCancelClick}>Cancel</Button>
                <Button color="primary" onClick={this._onBackClick} disabled={activeStep === 0}>Back</Button>
                <Button color="primary" onClick={this._onNextClick} disabled={activeStep === 0}>{activeStep === 2 ? 'Done' : 'Next'}</Button>
            </DialogActions>
        </Dialog>
    }
}


export default withStyles(styles)(AddCompletePDF);