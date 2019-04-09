import React from 'react';

import { TextField } from "material-ui";
import AsyncDialog from "./AsyncDialog";

class ChangeBandDescDialog extends React.Component {
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
        return <AsyncDialog title='Add description' confirmText='Confirm' onRef={ref => this.changeNamedialog = ref}>
            <TextField
                label="Description"
                multiline
                margin="normal"
                variant="outlined"
                rowsMax="5"
                onChange={e => this._onTextFieldChange(e, 'desc')}
                style={{
                    width: '500px',
                }}
            />  
        </AsyncDialog>
    }
}

export default ChangeBandDescDialog;