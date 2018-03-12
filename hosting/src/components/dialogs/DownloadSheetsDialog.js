import React from 'react';

import AsyncDialog from "./AsyncDialog";

class DownloadSheetsDialog extends React.Component {
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
        const {instrument} = this.state;

        return <AsyncDialog title={`Download sheets for ${instrument && instrument.name}?`} confirmText='Download' onRef={ref => this.dialog = ref}>
        </AsyncDialog>
    }
}


export default DownloadSheetsDialog;