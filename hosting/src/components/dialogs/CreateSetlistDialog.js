import React from 'react';

import {TextField} from "material-ui";
import AsyncDialog from "./AsyncDialog";

import {DateTimePicker} from "material-ui-pickers";
import Moment from 'moment';

class CreateSetlistDialog extends React.Component {
    data = {
        name: '',
        date: new Moment()
    };

    state = {
        date: new Moment()
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

    _onDateChange(e){
        this.data['date'] = e;
        this.setState({date: e});
    }

    render() {
        return <AsyncDialog title='Create Setlist' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField label='Name' onChange={e => this._onTextFieldChange(e, 'title')}/>
            <TextField label='Place' onChange={e => this._onTextFieldChange(e, 'place')}/>            
            <DateTimePicker
                color='black'
                value={this.state.date}
                onChange={date => this._onDateChange(date)}
            />
        </AsyncDialog>
    }
}

export default CreateSetlistDialog;