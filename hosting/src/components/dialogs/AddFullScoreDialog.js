import React from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Step, StepLabel, Stepper,
    SvgIcon, withStyles
} from "material-ui";
import { Add } from "material-ui-icons";
import CreateScoreStep from "./CreateScoreStep";
import firebase from 'firebase';
import ModalImage from 'react-modal-image'

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
            <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-2 17l-5-5 1.4-1.4 3.6 3.6 7.6-7.6L19 8l-9 9z" />
        </SvgIcon> :
        <SvgIcon {...props} {...extraProps}>
            <circle cx="12" cy="12" r="12" />
            <text x="12" y="16" textAnchor="middle"
                style={{ fill: '#fff', fontSize: '0.75rem', fontFamily: 'Roboto' }}>{props.number}</text>
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
                scoreData: { title: pdf.name.split('-')[0].trim() }
            });

            const snapshot = await firebase.firestore().collection('instruments').get();
            const instruments = snapshot.docs
                .map(doc => ({ ...doc.data(), id: doc.id }))
                .sort((a, b) => a.name.localeCompare(b.name));

            const parts = pdf.parts.map(part => {
                const instr = instruments.find(instrument => instrument.id === part.instrumentId);
                part.instrument = instr.name;
            })

            this.setState({
                instruments: instruments,
                parts: pdf.parts || []
            });

            this.__resolve = resolve;
            this.__reject = reject;
        });
    }

    _onScoreClick(scoreId) {
        this.setState({ scoreData: { id: scoreId }, activeStep: 2 });
    }

    _onNewScoreClick = () => {
        this.setState({ activeStep: 1 });
    };

    _onNextClick = () => {
        let { activeStep, scoreData, pdf, parts } = this.state;

        if (activeStep < 2) {
            this.setState({ activeStep: activeStep + 1 });
        }

        if (activeStep === 1) {
            this.setState({ scoreCreated: true });
        }

        if (activeStep === 2) {
            this.__resolve({
                score: scoreData,
                pdf: pdf,
                parts: parts
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
        this.setState({ open: false, parts: [], scoreData: {}, activeStep: 0, scoreCreated: false });
    };

    _onBackClick = () => {
        const { activeStep, scoreCreated } = this.state;
        this.setState({ activeStep: activeStep === 2 && !scoreCreated ? 0 : activeStep - 1, scoreCreated: false });
    };

    _onScoreDataChange = data => {
        this.setState({ scoreData: data })
    };

    _onSelectChange(pageIndex, e) {
        const parts = [...this.state.parts];

        const part = parts.find(part => part.page === pageIndex + 1);
        part.instrumentId = e.target.value.id;
        part.instrument = e.target.value.name;

        this.setState({ parts: parts })
    }

    _onRemovePart = index => {
        const parts = [...this.state.parts];
        parts.splice(parts.findIndex(part => part.page === index), 1);
        this.setState({ parts });
    };

    render() {
        const { activeStep, open, pdf, parts, scoreCreated, scoreData, instruments } = this.state;
        const { classes, band } = this.props;

        if (!open) return null;

        return <Dialog open={open} classes={{ paper: classes.dialog__paper }} fullScreen>
            <DialogTitle>Add full score</DialogTitle>
            <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
                <Stepper activeStep={activeStep}>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 0 ? 1 : 0} completed={activeStep > 0 ? 1 : 0}
                            number={1} />}>Select score</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 1 ? 1 : 0} completed={scoreCreated ? 1 : 0}
                            number={2} />}>Create new</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel icon={<StepIcon active={activeStep === 2 ? 1 : 0} completed={activeStep > 2 ? 1 : 0}
                            number={3} />}>Select instruments</StepLabel>
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
                        activeStep === 1 &&
                        <CreateScoreStep defaultData={scoreData} pdf={pdf} onChange={this._onScoreDataChange} />
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
                                    <div width='300%'>
                                        <ModalImage
                                            small={page.croppedURL}
                                            large={page.originalURL}
                                            hideDownload
                                            hideZoom
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flex: 1, height: '100%', overflowY: 'auto', padding: '12px 16px' }}>
                                    {parts.map((part, index) =>
                                        <div key={index} style={{ display: 'flex', marginBottom: 30 }}>
                                            {pageIndex + 1 === part.page &&
                                                <FormControl style={{ marginRight: 20, width: 200 }}>
                                                    <InputLabel htmlFor="instrument"> Instrument </InputLabel>
                                                    <Select
                                                        value={part.instrumentId ? part.instrumentId : part.instrument[0].id}
                                                        onChange={e => this._onSelectChange(index, e)}
                                                        renderValue={() => part.instrument === 'No instruments detected' ? 'Select instrument' : part.instrument}
                                                    >
                                                        {
                                                            instruments.map(instrument =>
                                                                <MenuItem key={instrument.id} value={instrument}>{instrument.name}</MenuItem>
                                                            )
                                                        }
                                                    </Select>
                                                </FormControl>
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
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
