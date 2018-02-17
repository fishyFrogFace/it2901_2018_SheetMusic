import React from 'react';

import {withStyles} from "material-ui/styles";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "material-ui";

const styles = {
};

class FormDialog extends React.Component {
    state = {
        open: false
    };

    inputs = {

    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    open() {
        this.setState({open: true});
        return new Promise((resolve, reject) => {
            this.__resolve = resolve;
            this.__reject = reject
        })
    }

    _onCancelClick() {
        this.__reject();
        this.setState({open: false});
    }

    _onConfirmClick() {
        let children = typeof this.props.children === 'object' ? [this.props.children] : this.props.children;

        let data = {};
        for (let child of children) {
            data[child.props.name] = child.props.value;
        }

        this.__resolve(data);
        this.setState({open: false})
    }

    render() {
        const {classes, title='Dialog', confirmText='Confirm'} = this.props;
        const {open} = this.state;

        return <Dialog open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {this.props.children}
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => this._onCancelClick()}>Cancel</Button>
                <Button color="primary" onClick={() => this._onConfirmClick()} autoFocus>{confirmText}</Button>
            </DialogActions>
        </Dialog>
    }
}


export default withStyles(styles)(FormDialog);