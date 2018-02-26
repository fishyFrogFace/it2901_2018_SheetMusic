import React from 'react';

import {MenuItem, Select} from "material-ui";
import AsyncDialog from "../AsyncDialog";

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
        await this.dialog.open();
        return this.state.selectedItem;
    }

    _onItemChange(e) {
        this.setState({selectedItem: e.target.value})
    }

    render() {
        const {title, items, confirmText} = this.props;
        const {selectedItem} = this.state;

        return <AsyncDialog title={title} confirmText={confirmText} onRef={ref => this.dialog = ref}>
            <Select
                name='value'
                value={selectedItem}
                onChange={e => this._onItemChange(e)}
            >
                {items.map((item, index) => <MenuItem key={index} value={index}>{item.name}</MenuItem>)}
            </Select>
        </AsyncDialog>
    }
}


export default SelectDialog;