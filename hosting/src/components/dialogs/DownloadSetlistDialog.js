import React from 'react';

import AsyncDialog from "./AsyncDialog";

import Select from 'react-virtualized-select';
import createFilterOptions from 'react-select-fast-filter-options';
import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import {
    Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Step,
    StepLabel,
    Stepper,
    SvgIcon, Typography,
    withStyles, FormControl, InputLabel,
    FormHelperText, 
    TextField,
    MenuItem,
    Input,
    Grid
} from "material-ui";

class DownloadSetlistDialog extends React.Component {
    state = {
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open(instrument) {
        this.setState({instrument: instrument});
        await this.dialog.open();
        return {}
    }

    render() {
        const options = [
            { value: 'Stanford University', label: 'Stanford' },
            { value: 'Stanford University2', label: 'Stanford2' },
            { value: 'Stanford University3', label: 'Stanford3' },
            { value: 'Stanford University4', label: 'Stanford4' },
            { value: 'Stanford University', label: 'Stanford' },
            { value: 'Stanford University2', label: 'Stanford2' },
            { value: 'Stanford University3', label: 'Stanford3' },
            { value: 'Stanford University4', label: 'Stanford4' },
            { value: 'Stanford University', label: 'Stanford' },
            { value: 'Stanford University2', label: 'Stanford2' },
            { value: 'Stanford University3', label: 'Stanford3' },
            { value: 'Stanford University4', label: 'Stanford4' },
            { value: 'Stanford University', label: 'Stanford' },
            { value: 'Stanford University2', label: 'Stanford2' },
            { value: 'Stanford University3', label: 'Stanford3' },
            { value: 'Stanford University4', label: 'Stanford4' },
            { value: 'Stanford University6', label: 'Stanford5' }
        ];
        const filterOptions = createFilterOptions({ options });
        const {instrument} = this.state;

        return <AsyncDialog title={`Download list?`} confirmText='Download' onRef={ref => this.dialog = ref}>
            <DialogContent style={{height: 211, width: 400}}>
                <Select
                    name="instrument"
                    value="any"
                    options={options}
                    filterOptions={filterOptions}
                    onChange={val => console.log(val)}
                />
            </DialogContent>
        </AsyncDialog>
    }
}

export default DownloadSetlistDialog;