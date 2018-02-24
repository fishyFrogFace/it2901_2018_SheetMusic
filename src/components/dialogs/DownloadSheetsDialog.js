import React from 'react';

import AsyncDialog from "./AsyncDialog";

class DownloadSheetsDialog extends React.Component {
    state = {
        selectedInstrument: 0,
        selectedNumber: -1
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.dialog.open();
        return {}
    }

    render() {
        return <AsyncDialog title='Download Sheet?' confirmText='Download' onRef={ref => this.dialog = ref}>
        </AsyncDialog>
    }
}


export default DownloadSheetsDialog;