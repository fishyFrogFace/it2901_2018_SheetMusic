import React from 'react';

import {withStyles} from "material-ui/styles";
import {Button, Typography} from "material-ui";
import {PlaylistAdd} from "material-ui-icons";

const styles = {
    root: {}
};

class Setlists extends React.Component {
    state = {};

    render() {
        const {classes, band} = this.props;
        return <div>
            <Typography>Setlists</Typography>
            <Button variant="fab" color="secondary" style={{position: 'fixed', bottom: 32, right: 32}}>
                <PlaylistAdd/>
            </Button>
        </div>
    }
}


export default withStyles(styles)(Setlists);