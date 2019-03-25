/**
 * This dialog is used in Setlist.js and changes the title and date of the setlist
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
        width: 210,
    },
});

class EditSetlistDialog extends React.Component {
    state = {
        title: '',
        date: '',
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

    _onDateChange = e => {
        this.setState({date: e.target.value});
    };

    render() {
        const {classes} = this.props;
        //const {title, date} = this.state;
        console.log(this.state.date);

        return <AsyncDialog title='Edit Setlist' confirmText='Save' onRef={ref => this.dialog = ref}>
            <TextField label='Title' onChange={this._onTitleInputChange} style={{marginBottom: 20}}/>
            <form className={classes.container} noValidate>
            <TextField onChange={this._onDateChange}
                    id="datetime-local"
                    label="Date and time"
                    type="datetime-local"
                    defaultValue={this.state.date}
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