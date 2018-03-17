import React from 'react';

import {TextField, withStyles} from "material-ui";
import AsyncDialog from "./AsyncDialog";

const styles = {
    input: {
        border: 0,
        outline: 0
    }
};

class EditSetlistDialog extends React.Component {
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

    async open(setlist) {
        this.setState({title: setlist.title, date: setlist.date});
        await this.dialog.open();
        return {title: this.state.title, date: this.state.date};
    }

    _onTitleInputChange = e => {
        this.setState({title: e.target.value});
    };

    _onDateChange = e => {
        this.setState({date: new Date(e.target.value)});
    };

    render() {
        const {classes} = this.props;
        const {title, date} = this.state;

        return <AsyncDialog title='Edit Setlist' confirmText='Save' onRef={ref => this.dialog = ref}>
            <TextField label='Title' value={title} onChange={this._onTitleInputChange}/>
            <input type="date" value={date.toISOString().substr(0, 10)} className={classes.input} style={{marginTop: 20}} onChange={this._onDateChange} />
        </AsyncDialog>
    }
}

export default withStyles(styles)(EditSetlistDialog);