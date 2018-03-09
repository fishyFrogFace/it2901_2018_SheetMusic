import React from 'react';

import {TextField} from "material-ui";
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
            <TextField required label='Name' onChange={e => this._onTextFieldChange(e, 'title')}/>
            <TextField label='Description' onChange={e => this._onTextFieldChange(e, 'description')}/>            
        </AsyncDialog>
    }
}

export default AddSetlistEventDialog;