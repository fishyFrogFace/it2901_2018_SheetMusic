/**
 * This dialog is used in setlist.js(Sub page setlist)
 * Makes it possible to create an event with a title, description and time(minutes)
 */

import React from 'react';

import {
    TextField,
    InputLabel,
    Input,
    InputAdornment,
    FormControl,
} from '@material-ui/core';
import AsyncDialog from './AsyncDialog';

class AddSetlistEventDialog extends React.Component {
    data = {
        description: '',
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    async open() {
        await this.dialog.open();
        return this.data;
    }

    _onTextFieldChange(e, name) {
        this.data[name] = e.target.value;
    }

    render() {
        return (
            <AsyncDialog
                title="Add Event"
                confirmText="Create"
                onRef={ref => (this.dialog = ref)}
            >
                <TextField
                    id="create-event-name"
                    required
                    label="Name"
                    onChange={e => this._onTextFieldChange(e, 'eventTitle')}
                />
                <TextField
                    id="create-event-description"
                    label="Description"
                    onChange={e => this._onTextFieldChange(e, 'description')}
                />
                <FormControl>
                    <InputLabel> Time </InputLabel>
                    <Input
                        id="create-event-time"
                        type="number"
                        label="Time"
                        onChange={e => this._onTextFieldChange(e, 'time')}
                        endAdornment={
                            <InputAdornment position="end">Min</InputAdornment>
                        }
                    />
                </FormControl>
            </AsyncDialog>
        );
    }
}

export default AddSetlistEventDialog;
