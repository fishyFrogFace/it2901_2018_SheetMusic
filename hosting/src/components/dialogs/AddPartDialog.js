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
import CreateScoreStep from "./CreateScoreStep";

const styles = {
    dialog__paper: {
        maxWidth: 800
    }
};

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
        partData: {},
        activeStep: 0,
        scoreCreated: false,
        open: false,
        pages: []
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        return new Promise((resolve, reject) => {
            this.setState({
                open: true,
                partData: {instrument: 0, instrumentNumber: 0},
                scoreData: {title: ''},
            });

            this.__resolve = resolve;
            this.__reject = reject;
        });
    }

    _onSelectChange(type, e) {
        const partData = {...this.state.partData};
        partData[type] = e.target.value;
        this.setState({partData: partData})
    }

    _onScoreClick(scoreId) {
        this.setState({scoreData: {id: scoreId}, activeStep: 2});
    }

    _onNewScoreClick = () => {
        this.setState({activeStep: 1});
    };

    _onNextClick = () => {
        const {activeStep, partData, scoreData} = this.state;
        const {band} = this.props;

        if (activeStep === 1) {
            this.setState({activeStep: 2, scoreCreated: true});
        } else {
            this.__resolve({
                score: scoreData,
                part: {
                    instrumentId: band.instruments[partData.instrument].id,
                    instrumentNumber: partData.instrumentNumber
                }
            });

            this.setState({
                open: false,
                activeStep: 0,
                scoreCreated: false,
                partData: {},
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

    _onScoreDataChange = data => {
        this.setState({scoreData: data})
    };

    render() {
        const {partData, scoreData, activeStep, scoreCreated, open} = this.state;

        const {band, classes} = this.props;

        if (!open) return null;

        return <Dialog open={open} classes={{paper: classes.dialog__paper}} fullScreen>
            <DialogTitle>Add part</DialogTitle>
            <DialogContent style={{display: 'flex', flexDirection: 'column', height: 500, width: 500}}>
                <Stepper activeStep={activeStep}>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 0 ? 1 : 0} completed={activeStep > 0 ? 1 : 0} number={1}/>}>Select score</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 1 ? 1 : 0} completed={scoreCreated ? 1 : 0} number={2}/>}>Create new</StepLabel>
                    </Step>
                    <Step >
                        <StepLabel icon={<StepIcon active={activeStep === 2 ? 1 : 0} number={3}/>}>Select instrument</StepLabel>
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
                        activeStep === 1 && <CreateScoreStep onChange={this._onScoreDataChange}/>
                    }
                    {
                        activeStep === 2 &&
                        <div>
                            <FormControl style={{marginRight: 20, width: 150}}>
                                <InputLabel htmlFor="instrument">Instrument</InputLabel>
                                <Select
                                    value={partData.instrument}
                                    onChange={e => this._onSelectChange('instrument', e)}
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
                                    value={partData.instrumentNumber}
                                    onChange={e => this._onSelectChange('instrumentNumber', e)}
                                >
                                    <MenuItem value={0}>None</MenuItem>
                                    {[1, 2, 3, 4, 5].map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                                </Select>
                            </FormControl>
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