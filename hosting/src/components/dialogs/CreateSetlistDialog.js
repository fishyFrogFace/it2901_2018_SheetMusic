/**
 * This dialog is used in setlists.js(main setlist page)
 * Makes it possible to create a setlist with a title, date and time(hours and seconds)
 */

import React from 'react';

import { TextField, withStyles } from "material-ui";

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

class CreateSetlistDialog extends React.Component {
    state = {
        title: '',
        date: new Date(),
        time: '',
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.dialog.open();
        return { title: this.state.title, date: this.state.date, time: this.state.time };
    }

    _onTitleInputChange = e => {
        this.setState({ title: e.target.value });
    };

    _onDateChange = e => {
        this.setState({ date: e.target.value });
    };

    _onTimeChange = e => {
        this.setState({ time: e.target.value })
    }

    render() {
        const { classes } = this.props;
        const { title, date, time } = this.state;

        return <AsyncDialog title='Create Setlist' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField
                id="create-setlist-title"
                label='Title'
                onChange={this._onTitleInputChange}
                style={{ marginBottom: 20 }}
                required
            />
            <form className={classes.container} noValidate>
                <TextField onChange={this._onDateChange}
                    id="create-setlist-date"
                    label="Date"
                    type="date"
                    defaultValue={this.date}
                    className={classes.textField}
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField onChange={this._onTimeChange}
                    id="create-setlist-time"
                    label="Time"
                    type="time"
                    defaultValue={this.date}
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

export default withStyles(styles)(CreateSetlistDialog);
