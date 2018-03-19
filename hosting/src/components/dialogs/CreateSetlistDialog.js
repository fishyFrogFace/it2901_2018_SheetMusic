import React from 'react';

import {TextField, withStyles} from "material-ui";
import AsyncDialog from "./AsyncDialog";

const styles = {
    input: {
        border: 0,
        outline: 0
    }
};

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
        this.setState({date: new Date(e.target.value)});
    };

    render() {
        const {classes} = this.props;
        const {title, date} = this.state;

        return <AsyncDialog title='Create Setlist' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField label='Title' onChange={this._onTitleInputChange}/>
            <input className={classes.input} style={{marginTop: 20}} type="date" onChange={this._onDateChange} />
        </AsyncDialog>
    }
}

export default withStyles(styles)(CreateSetlistDialog);