import React from 'react';

import { TextField } from '@material-ui/core';
import AsyncDialog from "./AsyncDialog";

//Component used by Members.js (the band page) to display a dialog for changing the band name.

class ChangeBandNameDialog extends React.Component {
    data = {};

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.changeNamedialog.open();
        return this.data;
    }

    _onTextFieldChange(e, name) {
        this.data[name] = e.target.value;
    }

    render() {
        return <AsyncDialog title='Change Bandname' confirmText='Confirm' onRef={ref => this.changeNamedialog = ref}>
            <TextField
                id='dialog-textfield'
                label='Name'
                onChange={e =>
                    this._onTextFieldChange(e, 'name')}
                style={{
                    width: '300px'
                }}
            />
        </AsyncDialog>
    }
}

export default ChangeBandNameDialog;