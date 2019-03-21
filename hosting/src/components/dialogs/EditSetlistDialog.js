/**
 * This dialog is used in Setlist.js
 */

import React from 'react';

import {TextField, withStyles} from "material-ui";
import AsyncDialog from "./AsyncDialog";

const styles = {
};

class EditSetlistDialog extends React.Component {
    state = {
        title: '',
        date: '',
        time: ''
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open(setlist) {
        this.setState({title: setlist.title, date: setlist.date});
        await this.dialog.open();
        return {title: this.state.title, date: this.state.date};
    }

    _onTitleInputChange = e => {
        this.setState({title: e.target.value});
    };

    _onDateChange = date => {
        this.setState({date: date});
    };

    _onTimeChange = time => {
        this.setState({time: time})
    }

    render() {
        const {classes} = this.props;
        const {title, date} = this.state;

        return <AsyncDialog title='Edit Setlist' confirmText='Save' onRef={ref => this.dialog = ref}>
            <TextField label='Title' onChange={this._onTitleInputChange} style={{marginBottom: 20}}/>
            <form className={classes.container} noValidate>
                <TextField
                    id="date"
                    label="Date"
                    type="date"
                    defaultValue={this.date}
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}
                />
                <TextField
                    id="time"
                    label="Time"
                    type="time"
                    defaultValue={this.time}
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}
                />

                
            </form>
        </AsyncDialog>
    }
}

export default withStyles(styles)(EditSetlistDialog);