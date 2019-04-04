import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Step, StepLabel, Stepper,
    SvgIcon, withStyles
} from "material-ui";
import {Add, Close} from "material-ui-icons";
import CreateScoreStep from "./CreateScoreStep";
import firebase from 'firebase';

const styles = {
    selectable: {
        width: '100%',
        height: 130,
        marginBottom: 15
    },

    dialog__paper: {
        maxWidth: 800
    },

    stepLabel__iconContainer: {
        color: 'black'
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
            <text x="12" y="16" textAnchor="middle"
                  style={{fill: '#fff', fontSize: '0.75rem', fontFamily: 'Roboto'}}>{props.number}</text>
        </SvgIcon>;
}

class AddFullScoreDialog extends React.Component {
    state = {
        parts: [],
        activeStep: 0,
        open: false,
        pdf: null,
        scoreCreated: false,
        scoreData: {},
        instruments: []
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open(pdf) {
        return new Promise(async (resolve, reject) => {
            this.setState({
                open: true,
                pdf: pdf,
                scoreData: {title: pdf.name.split('-')[0].trim()}
            });

            const snapshot = await firebase.firestore().collection('instruments').get();
            const instruments = snapshot.docs
                .map(doc => ({...doc.data(), id: doc.id}))
                .sort((a, b) => a.name.localeCompare(b.name));

            console.log(instruments);

            this.setState({
                instruments: instruments,
                parts: pdf.parts || []
            });

            this.__resolve = resolve;
            this.__reject = reject;
        });
    }

    _onScoreClick(scoreId) {
        this.setState({scoreData: {id: scoreId}, activeStep: 2});
    }

    _onNewScoreClick = () => {
        this.setState({activeStep: 1});
    };

    _onNextClick = () => {
        let {activeStep, scoreData, pdf, parts} = this.state;
        const {band} = this.props;

        if (activeStep < 2) {
            this.setState({activeStep: activeStep + 1});
        }

        if (activeStep === 1) {
            this.setState({scoreCreated: true});
        }

        if (activeStep === 2) {
            parts = [...parts.sort((a, b) => a.page - b.page), {page: pdf.pages.length}];

            const _parts = [];

            for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];

                for (let instr of part.instruments) {
                    const _part = {instrumentId: instr.id, pages: []};

                    for (let j = parts[i].page; j < parts[i + 1].page; j++) {
                        _part.pages.push(pdf.pages[j]);
                    }

                    _parts.push(_part);
                }
            }

            this.__resolve({
                score: scoreData,
                pdf: pdf,
                parts: _parts
            });

            this.setState({
                open: false,
                activeStep: 0,
                scoreCreated: false,
                scoreData: {},
                parts: []
            });
        }
    };

    _onCancelClick = () => {
        this.__reject("Dialog canceled");
        this.setState({open: false, parts: [], scoreData: {}, activeStep: 0, scoreCreated: false});
    };

    _onBackClick = () => {
        const {activeStep, scoreCreated} = this.state;
        this.setState({activeStep: activeStep === 2 && !scoreCreated ? 0 : activeStep - 1, scoreCreated: false});
    };

    _onScoreDataChange = data => {
        this.setState({scoreData: data})
    };

    _onAddPart = index => {
        const parts = [...this.state.parts];

        if (parts.some(part => part.page === index)) {
            parts.find(part => part.page === index).instruments.push({
                id: this.state.instruments[0].id
            })
        } else {
            parts.push({
                page: index,
                instruments: [{id: this.state.instruments[0].id}]
            });
        }

        this.setState({parts});
    };

    _onSelectChange(pageIndex, instrIndex, e) {
        const parts = [...this.state.parts];

        const part = parts.find(part => part.page === pageIndex);
        part.instruments[instrIndex].id = e.target.value;

        this.setState({parts: parts})
    }

    _onRemovePart = index => {
        const parts = [...this.state.parts];
        parts.splice(parts.findIndex(part => part.page === index), 1);
        this.setState({parts});
    };

    render() {
        const {activeStep, open, pdf, parts, scoreCreated, scoreData, instruments} = this.state;
        const {classes, band} = this.props;

        if (!open) return null;

        return <Dialog open={open} classes={{paper: classes.dialog__paper}} fullScreen>
            <DialogTitle>Add full score</DialogTitle>
            <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                <Stepper activeStep={activeStep}>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 0 ? 1 : 0} completed={activeStep > 0 ? 1 : 0}
                                                   number={1}/>}>Select score</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 1 ? 1 : 0} completed={scoreCreated ? 1 : 0}
                                                   number={2}/>}>Create new</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 2 ? 1 : 0} completed={activeStep > 2 ? 1 : 0}
                                                   number={3}/>}>Select instruments</StepLabel>
                    </Step>
                </Stepper>
                <div style={{overflowY: 'auto', flex: 1}}>
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
                        activeStep === 1 &&
                        <CreateScoreStep defaultData={scoreData} pdf={pdf} onChange={this._onScoreDataChange}/>
                    }
                    {
                        activeStep === 2 && pdf.pages.map((page, pageIndex) =>
                            <div key={pageIndex} style={{
                                display: 'flex',
                                marginBottom: 20,
                                border: '1px solid #E8E8E8',
                                height: 200
                            }}>
                                <div style={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    borderRight: '1px solid #E8E8E8'
                                }}>
                                    <img width="300%" src={page.croppedURL}/>
                                </div>
                                <div style={{flex: 1, height: '100%', overflowY: 'auto'}}>
                                    {
                                        parts.some(part => part.page === pageIndex) &&
                                        parts.find(part => part.page === pageIndex).instruments.map((instr, instrIndex) =>
                                            <div key={instrIndex} style={{display: 'flex', padding: '12px 16px', borderBottom: '1px solid #E8E8E8', justifyContent: 'space-between'}}>
                                                <FormControl style={{marginRight: 20, width: 150}}>
                                                    <InputLabel
                                                        htmlFor={`instrument${instrIndex}`}>Instrument {instrIndex + 1}</InputLabel>
                                                    <Select
                                                        value={instr.id}
                                                        onChange={e => this._onSelectChange(pageIndex, instrIndex, e)}
                                                        inputProps={{id: `instrument${instrIndex}`}}
                                                        disableUnderline={true}
                                                    >
                                                        {
                                                            instruments.map(instrument =>
                                                                <MenuItem key={instrument.id}
                                                                          value={instrument.id}>{instrument.name}</MenuItem>
                                                            )
                                                        }
                                                    </Select>
                                                </FormControl>
                                                <IconButton onClick={() => this._onRemovePart(pageIndex, instrIndex)}>
                                                    <Close/>
                                                </IconButton>
                                            </div>
                                        )
                                    }
                                    <ListItem onClick={() => this._onAddPart(pageIndex)} button>
                                        <ListItemText primary="Add Part" />
                                    </ListItem>
                                </div>
                            </div>
                        )
                    }
                </div>
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={this._onCancelClick}>Cancel</Button>
                <Button color="secondary" onClick={this._onBackClick} disabled={activeStep === 0}>Back</Button>
                <Button color="secondary" onClick={this._onNextClick}
                        disabled={activeStep === 0}>{activeStep === 3 ? 'Done' : 'Next'}</Button>
            </DialogActions>
        </Dialog>
    }
}


export default withStyles(styles)(AddFullScoreDialog);
