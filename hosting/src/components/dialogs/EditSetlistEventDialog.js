/**
 * This dialog is displayed when the user clicks on add an event within a setlist
 */

import React from 'react';

import {TextField, InputLabel, Input, InputAdornment, FormControl} from "material-ui";
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
        console.log("event: " + event);
        this.setState({title: event.title, description: event.description, time: event.time})
        await this.dialog.open();
        return {title: this.state.title, description: this.state.title, time: this.state.time};
    }

    /*_onTextFieldChange(e, name) {
        this.state[name] = e.target.value;
    }*/
    _onTitleInputChange = e => {
        this.setState({title: e.target.value});
    };

    _onDescriptionInputChange = e => {
        this.setState({description: e.target.value})
    }

    _onTimeInputChange = e => {
        this.setState({time: e.target.value})
    }

    render() {

        const {title, description, time} = this.state;
        //console.log("title: " + title);
        //console.log("description: " + description);
        //console.log("time: " + time);
        return <AsyncDialog title='Edit Event' confirmText='Save' onRef={ref => this.dialog = ref}>
            <TextField defaultValue={title} label='Name' onChange={this._onTitleInputChange}/>
            <TextField defaultValue={description} label='Description' onChange={this._onDescriptionInputChange}/>
            <FormControl>
                <InputLabel> Time </InputLabel>
                <Input defaultValue={time} type='number' label='Time' onChange={this._onTimeInputChange} endAdornment={<InputAdornment position="end">Min</InputAdornment>}/>
            </FormControl>            
        </AsyncDialog>
    }
}

export default EditSetlistEventDialog;