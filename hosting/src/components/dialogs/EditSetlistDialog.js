import React from 'react';

import {TextField} from "material-ui";
import AsyncDialog from "./AsyncDialog";

import {DateTimePicker} from "material-ui-pickers";
import Moment from 'moment';

class EditSetlistDialog extends React.Component {
    data = {
        title: '',
        place: '',
        date: new Moment()
    };


    state = {
        date: new Moment(),
        setlist:{title:'', place: '', date: new Moment()}
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open(setlist) {
        this.setState({title: setlist.title, place: setlist.place, date:new Moment(setlist.date)});
        this.data.date = new Moment(setlist.date);
        this.data.title = setlist.title;
        this.data.place = setlist.place;

        await this.dialog.open();
        return this.data;
    }

    _onTextFieldChange(e, name) {
        this.data[name] = e.target.value;
        this.setState({key: Math.random()})
    }

    _onDateChange(e){
        this.data['date'] = e;
        this.setState({date:e});
    }

    render() {
        return <AsyncDialog title='Edit Setlist' confirmText='Save' onRef={ref => this.dialog = ref}>
            <TextField label='Title' value={this.data.title} onChange={e => this._onTextFieldChange(e, 'title')}/>
            <TextField label='Place' value={this.data.place} onChange={e => this._onTextFieldChange(e, 'place')}/>            
            <DateTimePicker
                            value={this.state.date.toString()}
                            onChange={date => this._onDateChange(date)}
            />
        </AsyncDialog>
    }
}

export default EditSetlistDialog;