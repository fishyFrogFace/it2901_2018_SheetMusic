import React from 'react';

import firebase from 'firebase';

import {withStyles} from "material-ui/styles";
import {Avatar, IconButton, List, ListItem, ListItemText, Paper, Typography, ListSubheader} from "material-ui";
import {Done, Clear, Star, RemoveCircle, QueueMusic} from 'material-ui-icons';
import AsyncDialog from '../../components/dialogs/AsyncDialog';
import Tooltip from 'material-ui/Tooltip';

const styles = theme => ({
    root: {}
});

class Members extends React.Component {
    state = {
        user: "none",
        title: "",
        message: "",
        isAdmin: false,
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
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
        const userRef = firebase.firestore().doc(`users/${member.uid}`);
        
        // confirm modal about accepting
        this.setState({
            title: "Accept new member",
            message: `Are you sure you want to accept ${member.user.displayName} as a member?`,
        });
        if(!await this.open()) return;

        // update users band refs
        let userBandRefs = (await userRef.get()).data().bandRefs || [];
        userBandRefs.push(bandRef);
        await memberRef.update({status: 'member'});
        await userRef.update({
            defaultBandRef: bandRef,
            bandRefs: userBandRefs,
        });
        // TODO: update user about accepted??
    }

    _onReject = async (member) => {
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
        
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
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
        const userRef = firebase.firestore().doc(`users/${member.uid}`);
        let admins = (await bandRef.get()).data().admins;
        let members = [];
        await bandRef.collection(`/members`).get().then(docs => {
            docs.forEach(doc => {
                members.push(doc.data());
            });
        });

        // confirm modals about leaving
        this.setState({
            title: "Leave band",
        });
        if(member.admin && admins.length < 2 && members.length > 1) {
            this.setState({
                message: `You are the final admin of ${this.props.band.name}. To leave the band you have to promote someone else to admin first.`,
            });
            if(!await this.open()) return;
            return;
        } else if(members.length < 2) {
            this.setState({
                message: `Are you sure you want to leave ${this.props.band.name}? You are the last member of the band and this action will lead to the deletion of the band.`,
            });
            if(!await this.open()) return;
        } else {
            this.setState({
                message: `Are you sure you want to leave ${this.props.band.name}?`,
            });
            if(!await this.open()) return;
        }

        // remove member from admin list if member was admin
        if(member.admin) {
            admins = admins.filter(admin => {
                return admin !== member.uid;
            });
            await bandRef.update({
                admins: admins,
            });
        }

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

        members = [];
        await bandRef.collection(`/members`).get().then(docs => {
            docs.forEach(doc => {
                members.push(doc.data());
            });
        });
        if(members.length < 1) {
            await bandRef.delete();
        }
    }

    _onRemove = async (member) => {
        const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
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
        
        // TODO: needs to update member about removal
    }

    _onMakeAdmin = async (member) => {
        const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`)
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

        // confirm modal about promotion to admin
        this.setState({
            title: "Promote to admin",
            message: `Are you sure you want to promote ${member.user.displayName} to admin of ${this.props.band.name}?`,
        });
        if(!await this.open()) return;

        await memberRef.update({
            admin: true,
        });

        // add member to the admin list
        let admins = (await bandRef.get()).data().admins || [];
        admins.push(member.uid);
        await bandRef.update({
            admins: admins,
        });
    }

    _onMakeSupervisor = async (member) => {
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

        // confirm modal about promotion to music supervisor
        this.setState({
            title: "Promotion",
            message: `Are you sure you want to promote ${member.user.displayName} to music supervisor of ${this.props.band.name}?`
        });
        if(!await this.open()) {
            return;
        }
        
        await memberRef.update({
            supervisor: true,
        });
    }

    _onDemoteSupervisor = async (member) => {
        const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

        // confirm modal about demoting from music supervisor
        this.setState({
            title: "Demote music supervisor",
            message: `Are you sure you want to demote ${member.user.displayName} from music supervisor of ${this.props.band.name}?`,
        });
        if(!await this.open()) return;

        await memberRef.update({
            supervisor: false,
        });
    }

    componentDidUpdate(prevProp, prevState) {
        const {band} = this.props;
        if(band.id !== prevProp.band.id) {
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
                this.setState({
                    isAdmin: false,
                })
            });
        }
    }

    render() {
        const {classes, band} = this.props;
        if(this.state.isAdmin) {
            return <div style={{display: 'flex', justifyContent: 'space-between', width: 600, paddingTop: 20, paddingLeft: 20}}>
                {band.members && band.members.length > 0 &&
                    <Paper style={{width: 400}}>
                        <List>
                            <ListSubheader>Band code: {band.code}</ListSubheader>
                            {
                                band.members.map((member, index) => 
                                <ListItem key={index} dense button disableRipple>
                                    <Avatar src={member.user.photoURL}/>
                                    <ListItemText primary={member.user.displayName}/>
                                    {member.admin && <Tooltip title="Admin"><Star color="secondary" /></Tooltip>}
                                    {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                    {member.supervisor && <Tooltip title="Music supervisor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                    {member.status === 'member' && !member.supervisor && <Tooltip title="Make music supervisor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                    {
                                        member.status === 'pending' && 
                                        <div>
                                            <Tooltip title="Accept membership request"><IconButton onClick={() => this._onAccept(member)}><Done style={{color: 'green'}} /></IconButton></Tooltip>
                                            <Tooltip title="Reject membership request"><IconButton onClick={() => this._onReject(member)}><Clear style={{color: 'red'}} /></IconButton></Tooltip>
                                        </div>
                                    }
                                    {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                    {
                                        !member.admin && member.status !== 'pending' && member.uid !== this.state.user && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>
                                    }
                                </ListItem>)
                            }
                        </List>
                    </Paper>
                }
                <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
                    <Typography variant="body1" >{this.state.message}</Typography>
                </AsyncDialog>
            </div>
        } else {
            return <div style={{display: 'flex', justifyContent: 'space-between', width: 600, paddingTop: 20, paddingLeft: 20}}>
                {band.members && band.members.length > 0 &&
                    <Paper style={{width: 400}}>
                        <List>
                            <ListSubheader>Band code: {band.code}</ListSubheader>
                            {
                                band.members.map((member, index) => 
                                    <ListItem key={index} dense button disableRipple>
                                        <Avatar src={member.user.photoURL}/>
                                        <ListItemText primary={member.user.displayName}/>
                                        {member.admin && <Tooltip title="Admin"><Star color="secondary" /></Tooltip>}
                                        {member.supervisor && <Tooltip title="Music supervisor"><QueueMusic color="secondary" /></Tooltip>}
                                        {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                    </ListItem>
                                )
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
}


export default withStyles(styles)(Members);