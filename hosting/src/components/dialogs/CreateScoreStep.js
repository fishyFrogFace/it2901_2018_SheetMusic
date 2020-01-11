import React from 'react';

import { IconButton, TextField, withStyles } from '@material-ui/core';
import { ArrowBack, ArrowForward, Done } from '@material-ui/icons';

//import ChipInput from 'material-ui-chip-input';
//TODO replace ChipInput with something else, since material-ui packages needs to be downgraded for this one feature
/* <div style={{ height: 20 }} />
<ChipInput
    label="Genres"
    classes={{
        chipContainer: classes.chipInput__chipContainer,
    }}
    onChange={e =>
        this._onDataChange('genres', { target: { value: e } })
    }
/>
<div style={{ height: 20 }} />
<ChipInput
    label="Tags"
    classes={{
        chipContainer: classes.chipInput__chipContainer,
    }}
    onChange={e =>
        this._onDataChange('tags', { target: { value: e } })
    }
/> */

// Sets the information in the first step of AddFullScoreDialog.js and AddPartsDialog.js
// Access from those two Dialogs
// Used to set composer, arranger, tags, genres and tempo

const styles = {
    chipInput__chipContainer: {
        minHeight: 'unset',
    },
};

class CreateScoreStep extends React.Component {
    state = {
        open: false,
        selectedPage: 0,
        data: {},
    };

    // Sets state
    componentWillMount() {
        if (this.props.defaultData) {
            this.setState({
                data: {
                    ...this.props.data,
                    title: this.props.defaultData.title,
                },
            });
        }
    }

    // Updates the state when you change title, composer, arranger etc.
    _onDataChange = (type, e) => {
        const val = isNaN(e.target.value)
            ? e.target.value
            : Number(e.target.value);

        const newData = { ...this.state.data, [type]: val };
        this.props.onChange(newData);
        this.setState({ data: newData });
    };

    // Updates before rendering
    componentDidMount = () => {
        const { pdf } = this.props;

        // Checks if the composer and arranger is found from the analysis and sets the state
        // to the results from the analysis
        if (
            pdf.composer !== 'No composer detected' &&
            pdf.arranger !== 'No arranger detected'
        ) {
            const newData = {
                ...this.state.data,
                composer: pdf.composer,
                arranger: pdf.arranger,
            };
            this.props.onChange(newData);
            this.setState({ data: newData });
        }

        // Checks if the composer is found by the analysis, but the arranger is not.
        // Updates the composer to one found by the analysis
        else if (
            pdf.composer !== 'No composer detected' &&
            pdf.arranger === 'No arranger detected'
        ) {
            const newData = { ...this.state.data, composer: pdf.composer };
            this.props.onChange(newData);
            this.setState({ data: newData });
        }

        // Checks if the arranger is found by the analysis, but the composer is not.
        // Updates the arranger to one found by the analysis
        else if (
            pdf.composer === 'No composer detected' &&
            pdf.arranger !== 'No arranger detected'
        ) {
            const newData = { ...this.state.data, arranger: pdf.arranger };
            this.props.onChange(newData);
            this.setState({ data: newData });
        }
    };

    // If multiple pages of the pdf. Then jumps to the previous page of the pdf
    _onPrevImageClick = e => {
        const { selectedPage } = this.state;
        this.setState({
            selectedPage: selectedPage > 0 ? selectedPage - 1 : 0,
        });
    };

    // If multiple pages of the pdf. Then jumps to the next page of the pdf
    _onNextImageClick = e => {
        const { pdf } = this.props;
        const { selectedPage } = this.state;
        this.setState({
            selectedPage:
                selectedPage < pdf.pages.length - 1
                    ? selectedPage + 1
                    : pdf.pages.length - 1,
        });
    };

    // Renders the page
    render() {
        const { pdf } = this.props;
        const { classes } = this.props;
        const { selectedPage, data } = this.state;

        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pdf && (
                    <div
                        style={{
                            height: 300,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: 48,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <IconButton onClick={this._onPrevImageClick}>
                                <ArrowBack />
                            </IconButton>
                        </div>
                        <img
                            src={pdf.pages[selectedPage].originalURL}
                            style={{ width: '100%' }}
                        />
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                width: 48,
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <IconButton onClick={this._onNextImageClick}>
                                <ArrowForward />
                            </IconButton>
                        </div>
                    </div>
                )}
                {/*Updates the title page and sets default title*/}
                <TextField
                    label="Title"
                    style={{ marginBottom: 20 }}
                    defaultValue={pdf.name}
                    onChange={e => this._onDataChange('title', e)}
                />
                {/*Updates the composer page and sets default composer*/}
                {pdf.composer === 'No composer detected' && (
                    <TextField
                        label="Composer"
                        style={{ marginBottom: 20 }}
                        onChange={e => this._onDataChange('composer', e)}
                    />
                )}
                {/*Updates the composer page and sets analyzed composer*/}
                {pdf.composer !== 'No composer detected' && (
                    <TextField
                        label="Composer"
                        style={{ marginBottom: 20 }}
                        defaultValue={pdf.composer}
                        onChange={e => this._onDataChange('composer', e)}
                    />
                )}
                {/*Updates the arranger page and sets default title*/}
                {pdf.arranger === 'No arranger detected' && (
                    <TextField
                        label="Arranger"
                        style={{ marginBottom: 20 }}
                        onChange={e => this._onDataChange('arranger', e)}
                    />
                )}
                {/*Updates the arranger page and sets analyzed title*/}
                {pdf.arranger !== 'No arranger detected' && (
                    <TextField
                        label="Arranger"
                        style={{ marginBottom: 20 }}
                        defaultValue={pdf.arranger}
                        onChange={e => this._onDataChange('arranger', e)}
                    />
                )}
                {/*Updates the tempo*/}
                <TextField
                    label="Tempo"
                    onChange={e => this._onDataChange('tempo', e)}
                    type="number"
                    onKeyDown={e => {
                        if (
                            e.key !== 'Backspace' &&
                            (e.key === '-' || data.tempo * 10 > 330)
                        ) {
                            e.preventDefault();
                        }
                    }}
                />
                <div style={{ height: 20 }} >
                    <p>ChipInput should be here (but under the div)</p>
                </div>
                <div style={{ height: 20 }} >
                    <p>ChipInput should be here (but under the div)</p>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(CreateScoreStep);
