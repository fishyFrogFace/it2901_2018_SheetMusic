import React from 'react';

import {FormControl, InputLabel, MenuItem, Select} from "material-ui";
import AsyncDialog from "./AsyncDialog";

class AddSheetsDialog extends React.Component {
    state = {
        selectedInstrument: 0,
        selectedNumber: -1
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.dialog.open();
        return {instrument: this.props.instruments[this.state.selectedInstrument], number: this.state.selectedNumber}
    }

    _onInstrumentChange(e) {
        this.setState({selectedInstrument: e.target.value})
    }

    _onNumberChange(e) {
        this.setState({selectedNumber: e.target.value})
    }

    render() {
        const {instruments} = this.props;

        if (!instruments) return null;

        const {selectedInstrument, selectedNumber} = this.state;

        return <AsyncDialog title='Add Sheets' confirmText='Add' onRef={ref => this.dialog = ref}>
            <FormControl style={{width: 150}}>
                <InputLabel htmlFor="instrument">Instrument</InputLabel>
                <Select
                    value={selectedInstrument}
                    onChange={e => this._onInstrumentChange(e)}
                    inputProps={{id: 'instrument'}}
                >
                    {instruments.map((instrument, index) => <MenuItem key={index} value={index}>{instrument.name}</MenuItem>)}
                </Select>
            </FormControl>
            <FormControl style={{width: 150, marginTop: 20}}>
                <InputLabel htmlFor="number">Instrument Number</InputLabel>
                <Select
                    value={selectedNumber}
                    onChange={e => this._onNumberChange(e)}
                >
                    <MenuItem value={-1}>None</MenuItem>
                    {[1, 2, 3, 4, 5].map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                </Select>
            </FormControl>
        </AsyncDialog>
    }
}


export default AddSheetsDialog;