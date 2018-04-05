import React from 'react';

import firebase from 'firebase';

import {withStyles} from "material-ui/styles";
import {Avatar, IconButton, List, ListItem, ListItemText, Paper, Typography} from "material-ui";
import {Done, Clear} from 'material-ui-icons';

const styles = {
    root: {}
};

class Members extends React.Component {
    state = {};

    _onAccept = async (member) => {
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
        await memberRef.update({status: 'accepted'});
    }

    _onReject = async (member) => {
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
        await memberRef.delete();
    }

    render() {
        const {classes, band} = this.props;

        return <div style={{display: 'flex', justifyContent: 'space-between', width: 600, paddingTop: 20, paddingLeft: 20}}>
            {band.members && band.members.length > 0 &&
                <Paper style={{width: 400}}>
                    <List>
                        {
                            band.members.map((member, index) => 
                            <ListItem key={index} dense button disableRipple>
                                <Avatar src={member.user.photoURL}/>
                                <ListItemText primary={member.user.displayName}/>
                                {member.status === 'pending' && <IconButton onClick={() => this._onAccept(member)}><Done /></IconButton>}
                                <IconButton onClick={() => this._onReject(member)}><Clear /></IconButton>
                            </ListItem>)
                        }
                    </List>
                </Paper>
            }
        </div>
    }
}


export default withStyles(styles)(Members);