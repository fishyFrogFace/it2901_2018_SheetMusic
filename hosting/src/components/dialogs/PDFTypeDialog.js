import React from 'react';

import {
    Button,
    Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField,
    withStyles
} from "material-ui";

const styles = {
};

class PDFTypeDialog extends React.Component {
    state = {
        open: false,
        value: 0
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        return new Promise((resolve, reject) => {
            this.setState({
                open: true
            });

            this.__resolve = resolve;
            this.__reject = reject;
        });
    }

    _onSelectChange = e => {
        this.setState({
            value: e.target.value
        })
    };

    _onCancelClick = () => {
        this.__reject();
        this.setState({open: false, value: 0});
    };

    _onSelectClick = () => {
        this.__resolve({type: this.state.value});
        this.setState({open: false, value: 0});
    };

    render() {
        const {open, value} = this.state;
        const {classes} = this.props;

        return <Dialog open={open}>
                <DialogTitle>Select PDF Content</DialogTitle>
                <DialogContent>
                    <FormControl style={{width: '100%'}}>
                        <InputLabel htmlFor="content">Content</InputLabel>
                        <Select
                            value={value}
                            onChange={this._onSelectChange}
                            inputProps={{id: 'content'}}
                        >
                            <MenuItem value={0}>Full Score</MenuItem>
                            <MenuItem value={1}>Multiple Parts</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={this._onCancelClick}>Cancel</Button>
                    <Button color="secondary" onClick={this._onSelectClick}>Select</Button>
                </DialogActions>
            </Dialog>;
    }
}

export default withStyles(styles)(PDFTypeDialog);