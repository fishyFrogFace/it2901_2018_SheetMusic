import React from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, Input, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Step, StepLabel, Stepper, SvgIcon,
    TextField,
    Typography,
    withStyles
} from "material-ui";
import AsyncDialog from "./AsyncDialog";
import {Add, CheckCircle} from "material-ui-icons";
import Selectable from "../Selectable";

const styles = {
    selectable: {
        width: '100%',
        height: 130,
        marginBottom: 15
    },

    stepLabel__iconContainer: {
        color: 'black'
    },

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

class AddFullScoreDialog extends React.Component {
    state = {
        pdfData: [],
        activeStep: 0,
        open: false,
        pdf: null,
        entered: false,
        selectedItems: new Set(),
        scoreCreated: false,
        scoreData: {}
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open(pdf) {
        return new Promise((resolve, reject) => {
            this.setState({open: true, pdf: pdf, scoreData: {title: pdf.name}});
            this.__resolve = resolve;
            this.__reject = reject;
        });
    }

    _onSelectChange(type, index, e) {
        const pdfData = [...this.state.pdfData];
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
        const {activeStep, pdfData, scoreData, pdf, selectedItems} = this.state;
        const {band} = this.props;

        if (activeStep < 3) {
            this.setState({activeStep: activeStep + 1});
        }

        if (activeStep === 1) {
            this.setState({scoreCreated: true});
        }

        if (activeStep === 2) {
            this.setState({pdfData: Array.from(selectedItems).map(page => ({page: page, instrument: 0, instrumentNumber: 0}))});
        }

        if (activeStep === 3) {
            const instruments = [];

            const lastPage = pdf.pagesCropped.length - 1;

            for (let i = 0; i < pdfData.length; i++) {
                let data = pdfData[i];

                const pages = [];
                const nextPageIndex = i === pdfData.length - 1 ? lastPage : pdfData[i + 1].page;
                for (let j = data.page; j < nextPageIndex; j++) {
                    pages.push(j);
                }

                instruments.push({
                    instrumentId: band.instruments[data.instrument].id,
                    instrumentNumber: data.instrumentNumber,
                    pagesCropped: pages.map(page => pdf.pagesCropped[page]),
                    pagesOriginal: pages.map(page => pdf.pagesOriginal[page])
                });
            }

            this.__resolve({
                score: scoreData,
                instruments: instruments
            });

            this.setState({
                open: false,
                activeStep: 0,
                scoreCreated: false,
                scoreData: {},
                pdfData: []
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

    _onScoreDataChange = (type, e) => {
        this.setState({scoreData: {...this.state.scoreData, [type]: e.target.value}});
    };

    render() {
        const {activeStep, open, pdf, entered, selectedItems, pdfData, scoreData, scoreCreated} = this.state;
        const {classes, band} = this.props;

        if (!open) return null;

        return <Dialog open={open} onEntered={this._onDialogEntered} classes={{paper: classes.dialog__paper}}>
            <DialogTitle>Create score</DialogTitle>
            <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                <Stepper activeStep={activeStep}>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 0 ? 1 : 0} completed={activeStep > 0 ? 1 : 0} number={1}/>}>Select score</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 1 ? 1 : 0} completed={scoreCreated ? 1 : 0} number={2}/>}>Create new</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 2 ? 1 : 0} completed={activeStep > 2 ? 1 : 0} number={3}/>}>Select split points</StepLabel>
                    </Step>
                    <Step >
                        <StepLabel icon={<StepIcon active={activeStep === 3 ? 1 : 0} number={4}/>}>Select instruments</StepLabel>
                    </Step>
                </Stepper>
                <div style={{overflowY: 'auto', width: '100%', height: 500}}>
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
                        activeStep === 2 && entered && pdf.pagesCropped.map((page, index) =>
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


                    {
                        activeStep === 3 && pdf.pagesCropped.filter((_, index) => selectedItems.has(index)).map((page, index) =>
                            <div key={index} style={{display: 'flex', alignItems: 'center', marginBottom: 20}}>
                                <div style={{width: 200, height: 150, overflow: 'hidden', marginRight: 20, border: '1px solid #E8E8E8'}}>
                                    <img width="300%" src={page}/>
                                </div>
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
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={this._onCancelClick}>Cancel</Button>
                <Button color="secondary" onClick={this._onBackClick} disabled={activeStep === 0}>Back</Button>
                <Button color="secondary" onClick={this._onNextClick} disabled={activeStep === 0 || (activeStep === 2 && selectedItems.size === 0)}>{activeStep === 3 ? 'Done' : 'Next'}</Button>
            </DialogActions>
        </Dialog>
    }
}


export default withStyles(styles)(AddFullScoreDialog);