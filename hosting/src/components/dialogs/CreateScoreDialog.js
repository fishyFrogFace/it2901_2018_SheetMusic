import React from 'react';

import {TextField} from "material-ui";
import AsyncDialog from "./AsyncDialog";

class CreateScoreDialog extends React.Component {
    data = {};

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.dialog.open();
        return this.data;
    }

    _onTextFieldChange(e, name) {
        this.data[name] = e.target.value;
    }

    render() {
        return <AsyncDialog title='Create Score' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField label='Title' onChange={e => this._onTextFieldChange(e, 'title')}/>
            <TextField label='Composer' onChange={e => this._onTextFieldChange(e, 'composer')}/>
        </AsyncDialog>
    }
}

export default CreateScoreDialog;