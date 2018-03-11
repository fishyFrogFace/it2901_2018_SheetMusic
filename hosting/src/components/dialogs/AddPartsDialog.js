import React from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, Input, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Step, StepLabel, Stepper, SvgIcon,
    TextField,
    Typography,
    withStyles
} from "material-ui";
import AsyncDialog from "./AsyncDialog";
import {Add} from "material-ui-icons";

const styles = {};

function StepIcon(props) {
    const extraProps = {};

    if (props.active) {
        extraProps.color = 'secondary';
    } else {
        extraProps.nativeColor = 'rgba(0, 0, 0, 0.38)';
    }

    return props.completed ?
        <SvgIcon color='secondary'>
            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-2 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z"/>
        </SvgIcon> :
        <SvgIcon {...props} {...extraProps}>
            <circle cx="12" cy="12" r="12"/>
            <text x="12" y="16" textAnchor="middle" style={{fill: '#fff', fontSize: '0.75rem', fontFamily: 'Roboto'}}>{props.number}</text>
        </SvgIcon>;
}

class AddPartDialog extends React.Component {
    state = {
        scoreData: {},
        pdfData: {},
        activeStep: 0,
        scoreCreated: false,
        open: false,
        pdfs: []
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open(pdfs) {
        return new Promise((resolve, reject) => {
            this.setState({
                open: true,
                pdfs: pdfs,
                pdfData: pdfs.map(_ => ({instrument: 0, instrumentNumber: 0})),
                scoreData: {title: pdfs[0].name}
            });

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
        const {activeStep, pdfData, scoreData, pdfs} = this.state;
        const {band} = this.props;

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
        const {activeStep, scoreCreated} = this.state;
        this.setState({activeStep: activeStep === 2 && !scoreCreated ? 0 : activeStep - 1});
    };

    _onScoreDataChange = (type, e) => {
        this.setState({scoreData: {...this.state.scoreData, [type]: e.target.value}});
    };

    render() {
        const {pdfData, scoreData, activeStep, scoreCreated, open, pdfs} = this.state;

        const {band} = this.props;

        if (!open) return null;

        return <Dialog open={open}>
            <DialogTitle>Add parts</DialogTitle>
            <DialogContent style={{display: 'flex', flexDirection: 'column', height: 500, width: 500}}>
                <Stepper activeStep={activeStep}>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 0 ? 1 : 0} completed={activeStep > 0 ? 1 : 0} number={1}/>}>Select score</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 1 ? 1 : 0} completed={scoreCreated ? 1 : 0} number={2}/>}>Create new</StepLabel>
                    </Step>
                    <Step >
                        <StepLabel icon={<StepIcon active={activeStep === 2 ? 1 : 0} number={3}/>}>Select instruments</StepLabel>
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
                <Button color="secondary" onClick={this._onCancelClick}>Cancel</Button>
                <Button color="secondary" onClick={this._onBackClick} disabled={activeStep === 0}>Back</Button>
                <Button color="secondary" onClick={this._onNextClick} disabled={activeStep === 0}>{activeStep === 2 ? 'Done' : 'Next'}</Button>
            </DialogActions>
        </Dialog>
    }
}


export default withStyles(styles)(AddPartDialog);