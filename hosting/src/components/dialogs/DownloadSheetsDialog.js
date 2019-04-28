import React from 'react';

import AsyncDialog from "./AsyncDialog";

// Dialog for downloading a sheet of music. Comes from Score.js

class DownloadSheetsDialog extends React.Component {
    state = {
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    // Set states and open the dialog
    async open(instrument) {
        this.setState({ instrument: instrument });
        await this.dialog.open();
        return {}
    }

    // Renders the dialog
    render() {
        const { instrument } = this.state;

        return <AsyncDialog title={`Download sheets for ${instrument && instrument.name}?`} confirmText='Download' onRef={ref => this.dialog = ref}>
        </AsyncDialog>
    }
}


export default DownloadSheetsDialog;
