import React from 'react';

import AsyncDialog from "./AsyncDialog";

import Select from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';
import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'

import { DialogContent, } from "material-ui";

class DownloadSetlistDialog extends React.Component {
    everything = { value: "Everything", label: "Everything" };
    default = { value: "", label: "" };
    state = {};

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    // When the dialog is opened, this runs
    async open(instruments) {
        this.setState({ instruments: instruments });
        this.setState({ instrument: this.default });
        await this.dialog.open();
        return this.state;
    }

    render() {
        // If not for this, nothing will render because this.state.instruments us undefined
        // the first time render() is called.
        if (!this.state.instruments) {
            return <div />
        }

        // Some magic that makes the dropdown menu pretty
        const options = this.state.instruments.map(item => ({ value: item, label: item }));
        const filterOptions = createFilterOptions({ options });

        // Adds 'everything' as an option, for when you want to download all of it
        options.splice(0, 0, this.everything)

        // Returns the dialog with the dropdown and everything
        return <AsyncDialog title={`Download list?`} confirmText='Download' onRef={ref => this.dialog = ref}>
            <DialogContent style={{ height: 211, width: 400 }}>
                <Select
                    name="instrument"
                    value={this.state.instrument}
                    displayEmpty={true}
                    options={options}
                    filterOptions={filterOptions}
                    onChange={instrument => { this.setState({ instrument: instrument }); }}
                />
            </DialogContent>
        </AsyncDialog>
    }
}
export default DownloadSetlistDialog;