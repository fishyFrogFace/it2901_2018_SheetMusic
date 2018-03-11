import React from 'react';

import {TextField, InputLabel, Input, InputAdornment, FormControl} from "material-ui";
import AsyncDialog from "./AsyncDialog";

import {DateTimePicker} from "material-ui-pickers";
import Moment from 'moment';

class AddSetlistEventDialog extends React.Component {
    data = {
        description: ''
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.dialog.open();
        return this.data;
    }

    _onTextFieldChange(e, name) {
        this.data[name] = e.target.value;
    }

    render() {
        return <AsyncDialog title='Add Event' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField required label='Name' onChange={e => this._onTextFieldChange(e, 'eventTitle')}/>
            <TextField label='Description' onChange={e => this._onTextFieldChange(e, 'description')}/>
            <FormControl>
                <InputLabel> Time </InputLabel>
                <Input type='number' label='Time' onChange={e => this._onTextFieldChange(e, 'time')} endAdornment={<InputAdornment position="end">Min</InputAdornment>}/>
            </FormControl>            
        </AsyncDialog>
    }
}

export default AddSetlistEventDialog;