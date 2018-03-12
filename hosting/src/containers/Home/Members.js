import React from 'react';

import {withStyles} from "material-ui/styles";
import {Avatar, List, ListItem, ListItemText, Paper, Typography} from "material-ui";

const styles = {
    root: {}
};

class Members extends React.Component {
    state = {};

    render() {
        const {classes, band} = this.props;
        return <div style={{display: 'flex', justifyContent: 'space-between', width: 600}}>
            <Paper style={{width: 400}}>
                <List>
                    {band.members && band.members.map((member, index) =>
                        <ListItem key={index} dense button>
                            <Avatar src={member.photoURL}/>
                            <ListItemText primary={member.displayName}/>
                        </ListItem>)}
                </List>
            </Paper>
        </div>
    }
}


export default withStyles(styles)(Members);