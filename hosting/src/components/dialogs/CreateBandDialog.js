import React from 'react';

import {TextField, withStyles} from "material-ui";
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

    _onDataChange(name, e) {
        this.data[name] = e.target.value;
    }

    _onSelectChange = e => {

    };

    render() {
        const {classes} = this.props;

        return <AsyncDialog title='Create Band' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField label='Name' onChange={e => this._onDataChange('name', e)} style={{marginBottom: 20}}/>
        </AsyncDialog>
    }
}

export default withStyles(styles)(CreateBandDialog);