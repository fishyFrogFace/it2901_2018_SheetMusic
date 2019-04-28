/**
 * This dialog is used in Setlist.js (Sub page setlist)
 * It changes the title, date and time of a setlist
 */

import React from 'react';

import {TextField, withStyles} from "material-ui";
import AsyncDialog from "./AsyncDialog";

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 220,
    },
});

class EditSetlistDialog extends React.Component {
    state = {
        title: '',
        date: '',
        setlistTime: '',
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open(setlist) {
        this.setState({title: setlist.title, date: setlist.date, time: setlist.time});
        await this.dialog.open();
        return {title: this.state.title, date: this.state.date, setlistTime: this.state.setlistTime};
    }

    _onTitleInputChange = e => {
        this.setState({title: e.target.value});
    };

    _onDateChange = e => {
        this.setState({date: e.target.value});
    };

    _onTimeChange = e => {
        this.setState({setlistTime: e.target.value})
    }

    render() {
        const {classes} = this.props;
        const {title, date, time} = this.state;

        return <AsyncDialog title='Edit Setlist' confirmText='Save' onRef={ref => this.dialog = ref}>
            <TextField id="edit-setlist-title" label='Title' onChange={this._onTitleInputChange} style={{marginBottom: 20}} defaultValue={title}/>
            <form className={classes.container} noValidate>
                <TextField onChange={this._onDateChange}
                    id="edit-setlist-date"
                    label="Date"
                    type="date"
                    defaultValue={date}
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}
                />
                <TextField onChange={this._onTimeChange}
                    id="edit-setlist-time"
                    label="Time"
                    type="time"
                    defaultValue={time}
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}
                    inputProps={{
                        step: 300, // 5 min
                    }}
                />
            </form>
        </AsyncDialog>
    }
}

export default withStyles(styles)(EditSetlistDialog);