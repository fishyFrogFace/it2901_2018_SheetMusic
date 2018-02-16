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

    _onInputChange(label, e) {
        this.inputs[label] = e.target.value;
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
        this.__resolve(this.inputs);
        this.setState({open: false})
    }

    render() {
        const {classes, title='Dialog'} = this.props;
        const {open} = this.state;

        let children = (typeof this.props.children === 'object' ? [this.props.children] : this.props.children).map((child, index) => {
            return React.cloneElement(child, {
                key: index,
                onChange: e => this._onInputChange(child.props.label, e),
            })
        });

        return <Dialog open={open}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
            <DialogActions>
                <Button color="primary" onClick={() => this._onCancelClick()}>Cancel</Button>
                <Button color="primary" onClick={() => this._onConfirmClick()} autoFocus>Create</Button>
            </DialogActions>
        </Dialog>
    }
}


export default withStyles(styles)(FormDialog);