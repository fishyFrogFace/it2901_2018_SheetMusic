import React from 'react';

import {TextField, withStyles} from "material-ui";
//import {DatePicker} from "material-ui-pickers"

import AsyncDialog from "./AsyncDialog";

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
});

class CreateSetlistDialog extends React.Component {
    state = {
        title: '',
        date: new Date(),
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.dialog.open();
        return {title: this.state.title, date: this.state.date};
    }

    _onTitleInputChange = e => {
        this.setState({title: e.target.value});
    };

    _onDateChange = date => {
        this.setState({date: this.state.date});
    };

    render() {
        const {classes} = this.props;
        const {title, date} = this.state;

        console.log(date);
        
        return <AsyncDialog title='Create Setlist' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField label='Title' onChange={this._onTitleInputChange} style={{marginBottom: 20}} required/>
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
            </form>
        </AsyncDialog>

        {/*
        return <AsyncDialog title='Create Setlist' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField label='Title' onChange={this._onTitleInputChange} style={{marginBottom: 20}}/>
            <DatePicker
                margin="normal"
                label="Date"
                value={this.state.date}
                onChange={this._onDateChange}
            />
        </AsyncDialog>*/}
    }
}

export default withStyles(styles)(CreateSetlistDialog);