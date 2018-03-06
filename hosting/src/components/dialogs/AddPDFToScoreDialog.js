import React from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, Input, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Step, StepLabel, Stepper, TextField,
    Typography,
    withStyles
} from "material-ui";
import AsyncDialog from "./AsyncDialog";
import {Add} from "material-ui-icons";

const styles = {};


class AddPDFToScoreDialog extends React.Component {
    state = {
        scoreData: {},
        pdfData: {},
        activeStep: 0,
        scoreCreated: false,
        open: false,
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    componentWillReceiveProps(props) {
        if (props.pdfs && props.pdfs.length > 0) {
            this.setState({
                pdfData: props.pdfs.map(pdf => ({instrument: 0, instrumentNumber: 0})),
                scoreData: {title: props.pdfs[0].name}
            })
        }
    }

    async open() {
        return new Promise((resolve, reject) => {
            this.setState({open: true});
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
        const {activeStep, pdfData, scoreData} = this.state;
        const {band, pdfs} = this.props;

        if (this.state.activeStep === 1) {
            this.setState({activeStep: 2, scoreCreated: true});
        } else {
            this.__resolve({
                score: scoreData,
                instruments: Object.keys(pdfData).map(i => ({
                    pdfId: pdfs[i].id,
                    instrumentId: band.instruments[pdfData[i].instrument].id,
                    instrumentNumber: pdfData[i].instrumentNumber
                }))
            });

            this.setState({
                open: false,
                activeStep: 0,
                scoreCreated: false,
                selectionData: {pdfData: pdfs.map(_ => ({instrument: 0, instrumentNumber: 0}))},
                scoreData: {}
            });
        }
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

    _onScoreDataChange = (type, e) => {
        this.setState({scoreData: {...this.state.scoreData, [type]: e.target.value}});
    };

    render() {
        const {pdfData, scoreData, activeStep, scoreCreated, open} = this.state;

        const {band, pdfs} = this.props;

        if (!open) return null;

        return <Dialog open={open}>
            <DialogTitle>Add PDFs</DialogTitle>
            <DialogContent style={{display: 'flex', flexDirection: 'column', height: 500, width: 500}}>
                <Stepper activeStep={activeStep}>
                    <Step>
                        <StepLabel>Select score</StepLabel>
                    </Step>
                    <Step completed={scoreCreated}>
                        <StepLabel>Create new</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Select instrument</StepLabel>
                    </Step>
                </Stepper>
                <div>
                    {
                        activeStep === 0 &&
                        <List>
                            <ListItem button onClick={this._onNewScoreClick}>
                                <Add/>
                                <ListItemText primary='New score'/>
                            </ListItem>
                            {
                                band.scores && band.scores.map((score, index) =>
                                    <ListItem key={index} button onClick={() => this._onScoreClick(score.id)}>
                                        <ListItemText primary={score.title}/>
                                    </ListItem>
                                )
                            }
                        </List>
                    }
                    {
                        activeStep === 1 && <div style={{display: 'flex', flexDirection: 'column'}}>
                            <TextField label='Title' style={{marginBottom: 20}} value={scoreData.title} onChange={e => this._onScoreDataChange('title', e)}/>
                            <TextField label='Composer' style={{marginBottom: 20}} onChange={e => this._onScoreDataChange('composer', e)}/>
                        </div>
                    }

                    {
                        activeStep === 2 &&
                        <div>
                            {
                                pdfs && pdfs.map((pdf, index) =>
                                    <div key={index} style={{display: 'flex', marginBottom: 30}}>
                                        <FormControl style={{marginRight: 20, width: 200}} disabled>
                                            <InputLabel htmlFor="pdf-name">PDF</InputLabel>
                                            <Input id="pdf-name" value={pdf.name} />
                                        </FormControl>
                                        <FormControl style={{marginRight: 20, width: 150}}>
                                            <InputLabel htmlFor="instrument">Instrument</InputLabel>
                                            <Select
                                                value={pdfData[index].instrument}
                                                onChange={e => this._onSelectChange('instrument', index, e)}
                                                inputProps={{id: 'instrument'}}
                                            >
                                                {
                                                    band.instruments && band.instruments.map((instrument, index) =>
                                                        <MenuItem key={index} value={index}>{instrument.name}</MenuItem>
                                                    )
                                                }
                                            </Select>
                                        </FormControl>
                                        <FormControl style={{width: 70}}>
                                            <InputLabel htmlFor="number">Number</InputLabel>
                                            <Select
                                                value={pdfData[index].instrumentNumber}
                                                onChange={e => this._onSelectChange('instrumentNumber', index, e)}
                                            >
                                                <MenuItem value={0}>None</MenuItem>
                                                {[1, 2, 3, 4, 5].map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </div>
                                )
                            }
                        </div>

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


export default withStyles(styles)(AddPDFToScoreDialog);