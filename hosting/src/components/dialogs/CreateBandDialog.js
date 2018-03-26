import React from 'react';

import {FormControl, InputLabel, MenuItem, Select, TextField, withStyles} from "material-ui";
import AsyncDialog from "./AsyncDialog";
import ChipInput from 'material-ui-chip-input'

const styles = {
    chipInput__chipContainer: {
        minHeight: 'unset',
    }
};

class CreateBandDialog extends React.Component {
    presets = [{
        type: 'Big Band',
        instruments: [
            'Vocal', 'Alto Sax 1', 'Alto Sax 2',
            'Tenor Sax 1', 'Tenor Sax 2', 'Baritone Sax', 'Trumpet 1', 'Trumpet 2', 'Trumpet 3',
            'Trumpet 4', 'Trombone 1', 'Trombone 2', 'Trombone 3', 'Trombone 4', 'Guitar', 'Piano',
            'Bass', 'Drums'
        ]
    }];

    data = {};

    componentDidMount() {
        this.props.onRef(this);
        this.data.instruments = this.presets[0].instruments;
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.dialog.open();
        return this.data;
    }

    _onDataChange(name, e) {
        this.data[name] = e.target.value;
    }

    _onSelectChange = e => {

    };

    render() {
        const {classes} = this.props;

        return <AsyncDialog title='Create Band' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField label='Name' onChange={e => this._onDataChange('name', e)} style={{marginBottom: 20}}/>
            <FormControl style={{marginBottom: 20}}>
                <InputLabel htmlFor="preset">Band Preset</InputLabel>
                <Select
                    value={0}
                    onChange={this._onSelectChange}
                    inputProps={{id: 'preset'}}
                >
                    <MenuItem value={0}>Big Band</MenuItem>
                </Select>
            </FormControl>
            <ChipInput
                label='Instruments'
                defaultValue={this.presets[0].instruments}
                classes={{
                    chipContainer: classes.chipInput__chipContainer
                }}
                onChange={e => this._onDataChange('instruments', {target: {value: e}})}
            />
        </AsyncDialog>
    }
}

export default withStyles(styles)(CreateBandDialog);