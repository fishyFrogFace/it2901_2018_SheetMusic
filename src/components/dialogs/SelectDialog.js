import React from 'react';

import {withStyles} from "material-ui/styles";
import {MenuItem, Select} from "material-ui";
import FormDialog from "../FormDialog";

const styles = {};

class SelectDialog extends React.Component {
    state = {
        selectedItem: 0
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        return (await this.dialog.open()).value;
    }

    _onItemChange(e) {
        this.setState({selectedItem: e.target.value})
    }

    render() {
        const {title, items, confirmText} = this.props;
        const {selectedItem} = this.state;

        return <FormDialog title={title} confirmText={confirmText} onRef={ref => this.dialog = ref}>
            <Select
                name='value'
                value={selectedItem}
                onChange={e => this._onItemChange(e)}
            >
                {items.map((item, index) => <MenuItem key={index} value={index}>{item.name}</MenuItem>)}
            </Select>
        </FormDialog>
    }
}


export default withStyles(styles)(SelectDialog);