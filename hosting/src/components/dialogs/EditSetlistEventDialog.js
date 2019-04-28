/**
 * This dialog is used in setlist.js (Sub page setlist)
 * It changes the title, description and time of an event
 */

import React from 'react';

import { TextField, InputLabel, Input, InputAdornment, FormControl } from "material-ui";
import AsyncDialog from "./AsyncDialog";

class EditSetlistEventDialog extends React.Component {
    state = {
        title: '',
        description: '',
        time: ''
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open(event) {
        this.setState({ title: event.title, description: event.description, time: event.time })
        await this.dialog.open();
        return { title: this.state.title, description: this.state.description, time: this.state.time };
    }
    _onTitleInputChange = e => {
        this.setState({ title: e.target.value });
    };

    _onDescriptionInputChange = e => {
        this.setState({ description: e.target.value })
    }

    _onTimeInputChange = e => {
        this.setState({ time: e.target.value })
    }

    render() {

        const { title, description, time } = this.state;
        return <AsyncDialog title='Edit Event' confirmText='Save' onRef={ref => this.dialog = ref}>
            <TextField id="edit-event-title" defaultValue={title} label='Name' onChange={this._onTitleInputChange} />
            <TextField id="edit-event-description" defaultValue={description} label='Description' onChange={this._onDescriptionInputChange} />
            <FormControl>
                <InputLabel> Time </InputLabel>
                <Input id="edit-event-time" defaultValue={time} type='number' label='Time' onChange={this._onTimeInputChange} endAdornment={<InputAdornment position="end">Min</InputAdornment>} />
            </FormControl>
        </AsyncDialog>
    }
}

export default EditSetlistEventDialog;
