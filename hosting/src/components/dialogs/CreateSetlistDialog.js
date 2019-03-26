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

    _onDateChange = e => {
        this.setState({date: e.target.value});
    };

    render() {
        const {classes} = this.props;
        const {title, date} = this.state;

        //console.log(date);
        
        return <AsyncDialog title='Create Setlist' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField label='Title' onChange={this._onTitleInputChange} style={{marginBottom: 20}} required />
            <form className={classes.container} noValidate>
                <TextField onChange={this._onDateChange}
                    id="datetime-local"
                    label="Date and time"
                    type="datetime-local"
                    defaultValue={this.date}
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}
                />
            </form>
        </AsyncDialog>

    }
}

export default withStyles(styles)(CreateSetlistDialog);