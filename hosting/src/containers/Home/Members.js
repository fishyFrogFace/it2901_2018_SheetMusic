import React from 'react';

import firebase from 'firebase';

import {withStyles} from "material-ui/styles";
import {Avatar, IconButton, List, ListItem, ListItemText, Paper, Typography} from "material-ui";
import {Done, Clear, Star, RemoveCircle, QueueMusic} from 'material-ui-icons';
import AsyncDialog from '../../components/dialogs/AsyncDialog';

const styles = theme => ({
    root: {}
});

class Members extends React.Component {
    state = {
        isAdmin: false,
        user: "none",
        title: "",
        message: "",
    };

    open = async () => {
        try {
            await this.dialog.open();
            return true;
        } catch(error) {
            return false;
        }
    }

    _onAccept = async (member) => {
        const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}//${member.id}`);
        const userRef = firebase.firestore().doc(`users/${member.uid}`);
        
        // confirm modal about accepting
        this.setState({
            title: "Accept new member",
            message: `Are you sure you want to accept ${member.user.displayName} as a member?`,
        });
        if(!await this.open()) return;

        // update users band refs
        let userBandRefs = (await userRef.get()).data() || [];
        await memberRef.update({status: 'member'});
        await userRef.update({
            defaultBandRef: bandRef,
            bandRefs: [...userBandRefs, bandRef]
        });
        // TODO: update user about accepted??
    }

    _onReject = async (member) => {
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}//${member.id}`);
        
        // confirm modal about rejecting
        this.setState({
            title: "Reject new member",
            message: `Are you sure you want to reject ${member.user.displayName} as a member?`,
        });
        if(!await this.open()) return;

        // remove member from bands member list 
        await memberRef.delete();

        // TODO: update user about rejection
    }

    // REMARK: what to do with the band when last member leaves?
    _onLeave = async (member) => {
        const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/member/${member.id}`);
        const userRef = firebase.firestore().doc(`users/${member.uid}`);

        // confirm modal about leaving
        this.setState({
            title: "Leave band",
            message: `Are you sure you want to leave ${this.props.band.name}?`,
        });
        if(!await this.open()) return;

        // remove member from bands member list
        await memberRef.delete();

        // remove band from user bandRef list and update  defaultBandRef to the first element in bandRef list
        // if bandRef is empty then remove bandRef and defaultBandRef values
        // REMARK: adding/deleting things from an array in firebase is apparently a nono, better to use dictionary
        // see https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html

        const oldBandRefs = (await userRef.get()).data().bandRefs || [];
        const newBandRefs = [];
        const bandCode = (await bandRef.get()).data().code;
        for(let i in oldBandRefs) {
            const refCode = (await oldBandRefs[i].get()).data().code;
            if(refCode !== bandCode) {
                newBandRefs.push(oldBandRefs[i]);
            }
        }
        
        if(newBandRefs.length > 0) {
            await userRef.update({
                defaultBandRef: newBandRefs[0],
                bandRefs: newBandRefs,
            });
        } else {
            await userRef.update({
                defaultBandRef: firebase.firestore.FieldValue.delete(),
                bandRefs: firebase.firestore.FieldValue.delete(),
            });
        }
    }

    _onRemove = async (member) => {
        const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/member/${member.id}`);
        const userRef = firebase.firestore().doc(`users/${member.uid}`);

        // confirm modal about removal
        this.setState({
            title: "Remove member",
            message: `Are you sure you want to remove ${member.user.displayName} from ${this.props.band.name}?`,
        });
        if(!await this.open()) return;

        
        // remove member from bands member list
        await memberRef.delete();

        // same as onLeave, but removed by admin
        // remove band from user bandRef list and update  defaultBandRef to the first element in bandRef list
        // if bandRef is empty then remove bandRef and defaultBandRef values
        // REMARK: adding/deleting things from an array in firebase is apparently a nono, better to use dictionary
        // see https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html
        const oldBandRefs = (await userRef.get()).data().bandRefs || [];
        const newBandRefs = [];
        const bandCode = (await bandRef.get()).data().code;
        for(let i in oldBandRefs) {
            const refCode = (await oldBandRefs[i].get()).data().code;
            if(refCode !== bandCode) {
                newBandRefs.push(oldBandRefs[i]);
            }
        }
        
        if(newBandRefs.length > 0) {
            await userRef.update({
                defaultBandRef: newBandRefs[0],
                bandRefs: newBandRefs,
            });
        } else {
            await userRef.update({
                defaultBandRef: firebase.firestore.FieldValue.delete(),
                bandRefs: firebase.firestore.FieldValue.delete(),
            });
        }
        
        // needs to update member about removal
    }

    _onMakeAdmin = async (member) => {
        const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`)

        // TODO: confirm modal about promotion to admin
        this.setState({
            title: "Promote to admin",
            message: `Are you sure you want to promote ${member.user.displayName} to admin of ${this.props.band.name}?`,
        });
        if(!await this.open()) return;


        // add member to the admin list
        let admins = (await bandRef.get()).data().admins || [];
        admins.push(member.uid);
        await bandRef.update({
            admins: admins,
        });
    }

    _onMakeSupervisor = async (member) => {
        const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`)

        // TODO: confirm modal about promotion to music supervisor
        this.setState({
            title: "Promotion",
            message: `Are you sure you want to promote ${member.user.displayName} to music supervisor?`
        });
        if(!await this.open()) {
            return;
        }

        // add member to the supervisor list
        let supervisors = (await bandRef.get()).data().supervisors || [];
        supervisors.push(member.uid);
        await bandRef.update({
            supervisors: supervisors,
        });
    }

    _onDemoteSupervisor = async (member) => {
        const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`)

        // TODO: confirm modal about demoting from music supervisor
        this.setState({
            title: "Demote music supervisor",
            message: `Are you sure you want to demote ${member.user.displayName} from music supervisor of ${this.props.band.name}?`,
        });
        if(!await this.open()) return;

        // remove member from the supervisor list
        const supervisors = (await bandRef.get()).data().supervisors || [];
        const newSupervisors = [];
        for(let i in supervisors) {
            if(supervisors[i] !== member.uid) {
                newSupervisors.push(supervisors[i]);
            }
        }
        await bandRef.update({
            supervisors: newSupervisors,
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
            {band.members && band.members.length > 0 && this.state.isAdmin &&
                <Paper style={{width: 400}}>
                    <List>
                        {
                            band.members.map((member, index) => 
                            <ListItem key={index} dense button disableRipple>
                                <Avatar src={member.user.photoURL}/>
                                <ListItemText primary={member.user.displayName}/>
                                {member.isAdmin && <Star color="secondary" />}
                                {!member.isAdmin && <IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton>}
                                {member.isSupervisor && <IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton>}
                                {!member.isSupervisor && <IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton>}
                                {member.status === 'pending' && <div><IconButton onClick={() => this._onAccept(member)}><Done /></IconButton>
                                <IconButton onClick={() => this._onReject(member)}><Clear /></IconButton></div>}
                                {member.uid === this.state.user && <IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton>}
                            </ListItem>)
                        }
                    </List>
                </Paper>
            }
            {band.members && band.members.length > 0 && !this.state.isAdmin &&
                <Paper style={{width: 400}}>
                    <List>
                        {
                            band.members.map((member, index) => 
                            <div>
                                {member.status === 'member' && <ListItem key={index} dense button disableRipple>
                                    <Avatar src={member.user.photoURL}/>
                                    <ListItemText primary={member.user.displayName}/>
                                    {member.isAdmin && <Star color="secondary" />}
                                    {member.isSupervisor && <QueueMusic color="secondary" />}
                                    {member.uid === this.state.user && <IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton>}
                                </ListItem>}
                            </div>)
                        }
                    </List>
                </Paper>
            }
            <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
                <Typography variant="body1" >{this.state.message}</Typography>
            </AsyncDialog>
        </div>
    }
}


export default withStyles(styles)(Members);