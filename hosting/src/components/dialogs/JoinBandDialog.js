import React from 'react';

import {TextField} from "material-ui";
import AsyncDialog from "./AsyncDialog";

class JoinBandDialog extends React.Component {
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
        return <AsyncDialog title='Join Band' confirmText='Join' onRef={ref => this.dialog = ref}>
            <TextField label='Code' onChange={e => this._onTextFieldChange(e, 'code')}/>
        </AsyncDialog>
    }
}

export default JoinBandDialog;