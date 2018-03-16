import React from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {IconButton, Menu, MenuItem, Select, Snackbar} from "material-ui";
import ArrowBackIcon from 'material-ui-icons/ArrowBack';
import MoreVertIcon from 'material-ui-icons/MoreVert';

import firebase from 'firebase';
import 'firebase/storage';

import DownloadSheetsDialog from "../components/dialogs/DownloadSheetsDialog";
import {FileDownload} from "material-ui-icons";

const styles = {
    root: {}
};

class PDF extends React.Component {

    render() {
        const {classes, pdf} = this.props;
        const {} = this.state;

        return <div>
            {pdf}
        </div>
    }
}


export default withStyles(styles)(PDF);