import React from 'react';

import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, Input, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Step, StepLabel, Stepper, SvgIcon,
    withStyles
} from "material-ui";
import { Add } from "material-ui-icons";
import CreateScoreStep from "./CreateScoreStep";
import firebase from "firebase";

/* Dialog for when adding an unproccessed part to a score. Inherited from UnsortedPDFs */


const styles = {
    dialog__paper: {
        maxWidth: 800
    }
};

// Creates the design for the next button
function StepIcon(props) {
    const extraProps = {};

    if (props.active) {
        extraProps.color = 'secondary';
    } else {
        extraProps.nativeColor = 'rgba(0, 0, 0, 0.38)';
    }

    return props.completed ?
        <SvgIcon color='secondary'>
            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-2 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z" />
        </SvgIcon> :
        <SvgIcon {...props} {...extraProps}>
            <circle cx="12" cy="12" r="12" />
            <text x="12" y="16" textAnchor="middle" style={{ fill: '#fff', fontSize: '0.75rem', fontFamily: 'Roboto' }}>{props.number}</text>
        </SvgIcon>;
}

class AddPartsDialog extends React.Component {
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

    // Sets states when opening the dialog
    async open(pdfs) {
        return new Promise(async (resolve, reject) => {
            this.setState({
                open: true,
                pdfs: pdfs,
                scoreData: { title: pdfs[0].name }
            });

            // creates a list of instruments from the database
            const snapshot = await firebase.firestore().collection('instruments').get();
            const instruments = snapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id }))
                .sort((a, b) => a.name.localeCompare(b.name));

            this.setState({
                instruments: instruments,
                parts: pdfs.map(pdf => ({ pdf: pdf, instrumentId: pdf.parts[0].instrument[0].id !== undefined ? pdf.parts[0].instrument[0].id : instruments[0].id })),
            });

            this.__resolve = resolve;
            this.__reject = reject;
        });
    }

    // Updates the change of instruments
    _onSelectChange(index, e) {
        const parts = [...this.state.parts];
        parts[index].instrumentId = e.target.value;
        this.setState({ parts })
    }

    // Adds the part to an existing score
    _onScoreClick(scoreId) {
        this.setState({ scoreData: { id: scoreId }, activeStep: 2 });
    }

    // Adds the part to a new score
    _onNewScoreClick = () => {
        this.setState({ activeStep: 1 });
    };

    // Function to keep track of states for the different steps
    _onNextClick = () => {
        const { parts, scoreData } = this.state;

        if (this.state.activeStep === 1) {
            this.setState({ activeStep: 2, scoreCreated: true });
        } else {
            this.__resolve({
                score: scoreData,
                parts: parts,
            });

            this.setState({
                open: false,
                activeStep: 0,
                scoreCreated: false,
                parts: [],
                scoreData: {},
            });
        }
    };

    // Resets state when cancelling the process of processing a score
    _onCancelClick = () => {
        this.__reject("Dialog canceled");
        this.setState({ open: false, parts: [], scoreData: {}, activeStep: 0, scoreCreated: false });
    };

    // Sets correct state when going back to the previous step
    _onBackClick = () => {
        const { activeStep, scoreCreated } = this.state;
        this.setState({ activeStep: activeStep === 2 && !scoreCreated ? 0 : activeStep - 1, scoreCreated: false });
    };

    //Updates state when changing the data in step 1
    _onScoreDataChange = data => {
        this.setState({ scoreData: data })
    };

    // renders the page
    render() {
        const { parts, scoreData, activeStep, scoreCreated, open, pdfs, instruments } = this.state;

        const { band, classes } = this.props;

        // If not opened it returns null as state is not set
        if (!open) return null;

        return <Dialog open={open} classes={{ paper: classes.dialog__paper }} fullScreen>
            <DialogTitle>Add parts</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
                <Stepper activeStep={activeStep}>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 0 ? 1 : 0} completed={activeStep > 0 ? 1 : 0} number={1} />}>Select score</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 1 ? 1 : 0} completed={scoreCreated ? 1 : 0} number={2} />}>Create new</StepLabel>
                    </Step>
                    <Step >
                        <StepLabel icon={<StepIcon active={activeStep === 2 ? 1 : 0} number={3} />}>Select instruments</StepLabel>
                    </Step>
                </Stepper>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {
                        activeStep === 0 &&
                        <List>
                            <ListItem button onClick={this._onNewScoreClick}>
                                <Add />
                                <ListItemText primary='New score' />
                            </ListItem>
                            {
                                band.scores && band.scores.map((score, index) =>
                                    <ListItem key={index} button onClick={() => this._onScoreClick(score.id)}>
                                        <ListItemText primary={score.title} />
                                    </ListItem>
                                )
                            }
                        </List>
                    }
                    {
                        activeStep === 1 && <CreateScoreStep pdf={pdfs[0]} defaultData={scoreData} onChange={this._onScoreDataChange} />
                    }
                    {
                        activeStep === 2 &&
                        <div>
                            {
                                parts.map((part, index) =>
                                    <div key={index} style={{ display: 'flex', marginBottom: 30 }}>

                                        <FormControl style={{ marginRight: 20, width: 200 }} disabled>
                                            <InputLabel htmlFor="pdf-name">PDF</InputLabel>
                                            <Input id="pdf-name" value={part.pdf.name} />
                                        </FormControl>
                                        <FormControl style={{ marginRight: 20, width: 150 }}>
                                            <InputLabel htmlFor="instrument">Instrument</InputLabel>
                                            <Select
                                                value={part.instrumentId}
                                                onChange={e => this._onSelectChange(index, e)}
                                                inputProps={{ id: 'instrument' }}
                                            >
                                                {
                                                    // creates a list of instruments to choose from
                                                    instruments.map(instrument =>
                                                        <MenuItem key={instrument.id} value={instrument.id}>{instrument.name}</MenuItem>
                                                    )
                                                }
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


export default withStyles(styles)(AddPartsDialog);
