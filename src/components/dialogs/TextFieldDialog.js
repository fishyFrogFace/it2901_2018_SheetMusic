import React from 'react';

import {TextField} from "material-ui";
import AsyncDialog from "../AsyncDialog";


class TextFieldDialog extends React.Component {
    state = {
        values: []
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.dialog.open();
        return this.state.values;
    }

    _onTextFieldChange(e, i) {
        let values = [...this.state.values];
        values[i] = e.target.value;
        this.setState({values: values});
    }

    render() {
        const {title, labels, confirmText} = this.props;

        return <AsyncDialog title={title} confirmText={confirmText} onRef={ref => this.dialog = ref}>
            {
                labels.map((label, index) =>
                    <TextField key={index} label={label} onChange={(i => e => this._onTextFieldChange(e, i))(index)}/>)
            }
        </AsyncDialog>
    }
}

export default TextFieldDialog;