import React from 'react';

import {TextField} from "material-ui";
import AsyncDialog from "./AsyncDialog";

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
        return <AsyncDialog title='Change bandname' confirmText='Confirm' onRef={ref => this.changeNamedialog = ref}>
            <TextField label='Name' onChange={e => this._onTextFieldChange(e, 'name')} style={{width: '300px'}}/>
        </AsyncDialog>
    }
}

export default ChangeBandNameDialog;