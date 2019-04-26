import React from 'react';

import { TextField, withStyles } from "material-ui";
import AsyncDialog from "./AsyncDialog";

const styles = {
};

class CreateBandDialog extends React.Component {
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

    _onDataChangeName(name, e) {
        this.data[name] = e.target.value;
    }

    render() {
        return <AsyncDialog title='Create Band' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField id='dialog-textfield' label='Name' onChange={e => this._onDataChangeName('name', e)} style={{ marginBottom: 20, width: 300 }} />
        </AsyncDialog>
    }
}

export default withStyles(styles)(CreateBandDialog);