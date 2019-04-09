/**
 * AsyncDialog is used in AddSetlistEventDialog, AddSetlistScoresDialog, CreateBandDialog, CreateSetlistDialog
 * DownloadSheetsDialog, EditSetlistDialog, JoinBandDialog
 */

import React from 'react';

import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "material-ui";

class AsyncDialog extends React.Component {
    state = {
        open: false
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    open() {
        return new Promise((resolve, reject) => {
            this.setState({open: true});

            this.__resolve = resolve;
            this.__reject = reject
        })
    }

    _onCancelClick() {
        this.__reject("Dialog canceled");
        this.setState({open: false});
    }

    _onConfirmClick() {
        this.__resolve();
        this.setState({open: false})
    }

    render() {
        const {title='Dialog', confirmText='Confirm'} = this.props;
        const {open} = this.state;
        
        return <Dialog open={open} onClose={() => this._onCancelClick()}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent style={{display: 'flex', flexDirection: 'column'}}>
                {this.props.children}
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={() => this._onCancelClick()}>Cancel</Button>
                <Button color="secondary" onClick={() => this._onConfirmClick()} autoFocus>{confirmText}</Button>
            </DialogActions>
        </Dialog>
    }
}


export default AsyncDialog;