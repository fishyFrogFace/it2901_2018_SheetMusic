import React from 'react';

import { IconButton, TextField, withStyles } from "material-ui";
import ChipInput from 'material-ui-chip-input'
import { ArrowBack, ArrowForward, Done } from "material-ui-icons";

const styles = {
    chipInput__chipContainer: {
        minHeight: 'unset',
    }
};

class CreateScoreStep extends React.Component {
    state = {
        open: false,
        selectedPage: 0,
        data: {}
    };

    componentWillMount() {
        if (this.props.defaultData) {
            this.setState({ data: { ...this.props.data, title: this.props.defaultData.title } });
        }
    }

    _onDataChange = (type, e) => {
        const val = isNaN(e.target.value) ? e.target.value : Number(e.target.value);

        const newData = { ...this.state.data, [type]: val };
        this.props.onChange(newData);
        this.setState({ data: newData });
    };

    // _onSetData = () => {
    //     const { pdf } = this.props;

    //     console.log('pdf.composer', pdf.composer)
    //     console.log('pdf.arranger', pdf.arranger)

    //     if (pdf.composer !== 'No composer detected') {
    //         const newData = { ...this.state.data, composer: pdf.composer };
    //         this.props.onChange(newData);
    //         this.setState({ data: newData });
    //     }

    //     if (pdf.arranger !== 'No arranger detected') {
    //         const newData = { ...this.state.data, arranger: pdf.arranger };
    //         this.props.onChange(newData);
    //         this.setState({ data: newData });
    //     }
    // }

    componentDidMount() {
        const { pdf } = this.props;

        console.log('pdf.composer', pdf.composer)
        console.log('pdf.arranger', pdf.arranger)

        if (pdf.composer !== 'No composer detected') {
            const newData = { ...this.state.data, composer: pdf.composer };
            this.props.onChange(newData);
            this.setState({ data: newData });
        }

        if (pdf.arranger !== 'No arranger detected') {
            const newData = { ...this.state.data, arranger: pdf.arranger };
            this.props.onChange(newData);
            this.setState({ data: newData });
        }
    }

    _onPrevImageClick = e => {
        const { selectedPage } = this.state;
        this.setState({ selectedPage: selectedPage > 0 ? selectedPage - 1 : 0 })
    };

    _onNextImageClick = e => {
        const { pdf } = this.props;
        const { selectedPage } = this.state;
        this.setState({ selectedPage: selectedPage < pdf.pages.length - 1 ? selectedPage + 1 : pdf.pages.length - 1 })
    };

    render() {
        const { pdf } = this.props;
        const { classes } = this.props;
        const { selectedPage, data } = this.state;

        console.log('render', this.state.data)

        return <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pdf &&
                <div style={{ height: 300, position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: 48,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <IconButton onClick={this._onPrevImageClick}><ArrowBack /></IconButton>
                    </div>
                    <img src={pdf.pages[selectedPage].originalURL} style={{ width: '100%' }} />
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: 48,
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <IconButton onClick={this._onNextImageClick}><ArrowForward /></IconButton>
                    </div>
                </div>
            }
            <TextField
                label='Title'
                style={{ marginBottom: 20 }}
                defaultValue={pdf.name}
                onChange={e => this._onDataChange('title', e)}
                required='true'
            />
            {pdf.composer === 'No composer detected' &&
                <TextField
                    label='Composer'
                    style={{ marginBottom: 20 }}
                    onChange={e => this._onDataChange('composer', e)}
                    required='true'
                />}
            {pdf.composer !== 'No composer detected' &&
                <TextField
                    label='Composer'
                    style={{ marginBottom: 20 }}
                    defaultValue={pdf.composer}
                    onChange={e => this._onDataChange('composer', e)}
                    />
            }
            {pdf.arranger === "No arranger detected" &&
                <TextField
                    label='Arranger'
                    style={{ marginBottom: 20 }}
                    onChange={e => this._onDataChange('arranger', e)}
                    required='true'
                />}
            {pdf.arranger !== "No arranger detecter" &&
                <TextField
                    label='Arranger'
                    style={{ marginBottom: 20 }}
                    defaultValue={pdf.arranger}
                    onChange={e => this._onDataChange('arranger', e)}
                />}
            <TextField
                label="Tempo"
                onChange={e => this._onDataChange('tempo', e)}
                type="number"
                onKeyDown={e => {
                    if (e.key !== 'Backspace' && (e.key === '-' || data.tempo * 10 > 330)) {
                        e.preventDefault();
                    }
                }}
            />
            <div style={{ height: 20 }} />
            <ChipInput
                label='Genres'
                classes={{
                    chipContainer: classes.chipInput__chipContainer
                }}
                onChange={e => this._onDataChange('genres', { target: { value: e } })}
            />
            <div style={{ height: 20 }} />
            <ChipInput
                label='Tags'
                classes={{
                    chipContainer: classes.chipInput__chipContainer
                }}
                onChange={e => this._onDataChange('tags', { target: { value: e } })}
            />
        </div>
    }
}


export default withStyles(styles)(CreateScoreStep);