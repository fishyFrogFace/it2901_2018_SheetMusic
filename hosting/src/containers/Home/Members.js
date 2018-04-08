import React from 'react';

import firebase from 'firebase';

import {withStyles} from "material-ui/styles";
import {Avatar, IconButton, List, ListItem, ListItemText, Paper, Typography} from "material-ui";
import {Done, Clear, Star, RemoveCircle} from 'material-ui-icons';

const styles = {
    root: {}
};

class Members extends React.Component {
    state = {
        isAdmin: false,
        user: "none",
    };

    _onAccept = async (member) => {
        // TODO: confirm modal about accepting
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
        await memberRef.update({status: 'accepted'});
    }

    _onReject = async (member) => {
        // TODO: confirm modal about rejecting

        // remove member from bands member list
        // update member about rejection
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
        await memberRef.update({status: 'rejected'});
    }

    // odd case: what to do with the band when last member leaves?
    _onLeave = async (member) => {
        // TODO: confirm modal about leaving

        // remove member from bands member list

        // remove band from members bandRef list

        // update members defaultBandRef to the first element in bandRef list, if bandRef is empty then remove bandRef and defaultBandRef values
    }

    _onRemove = async (member) => {
        // TODO: confirm modal about removal

        // same as onLeave, but removed by admin
        // needs to update member about removal
    }

    _onPromote = async (member) => {
        // TODO: confirm modal about promotion
        const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`)
        await bandRef.update({
            admins: [...(bandRef.data().admins || []), member.uid]
        });
    }

    componentWillMount() {
        const {currentUser} = firebase.auth();
        this.setState({
            user: currentUser.uid,
        });
        firebase.firestore().doc(`bands/${this.props.band.id}`).get().then( snapshot => {
            const admins = snapshot.data().admins;
            for(let i in admins) {
                if(currentUser.uid === admins[i]) {
                    this.setState({
                        isAdmin: true
                    })
                    return;
                }
            }
        });
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
                                {this.state.isAdmin && <Star />}
                                {member.status === 'pending' && <div><IconButton onClick={() => this._onAccept(member)}><Done /></IconButton>
                                <IconButton onClick={() => this._onReject(member)}><Clear /></IconButton></div>}
                                {member.uid === this.state.user && <IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton>}
                            </ListItem>)
                        }
                    </List>
                </Paper>
            }
        </div>
    }
}


export default withStyles(styles)(Members);