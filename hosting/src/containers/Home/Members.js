import React from 'react';
import firebase from 'firebase';

import { withStyles } from "material-ui/styles";
import {
   Avatar, IconButton, List, ListItem, ListItemText, Paper, Typography, ListSubheader, ExpansionPanel, ExpansionPanelSummary,
   ExpansionPanelDetails, Divider, Checkbox, FormGroup, FormControlLabel
} from "material-ui";
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import { Done, Clear, Star, RemoveCircle, QueueMusic, Delete, Copy } from 'material-ui-icons';
import AsyncDialog from '../../components/dialogs/AsyncDialog';
import Tooltip from 'material-ui/Tooltip';


const styles = theme => ({
   root: {
      width: '100%',
   },
   heading: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontSize: theme.typography.pxToRem(15),
      fontWeight: 500,
      flexBasis: '33.33%',
      flexShrink: 0,
   },
   secondaryHeading: {
      fontSize: '13px',
      fontWeight: 400,
      color: 'rgba(0, 0, 0, 0.87)',
      padding: '0px 0px 10px 24px',
   },
   expansionPanel: {
      margin: '0',
      border: '0',
      boxShadow: 'none',
      '&:not(:last-child)': {
         borderBottom: 0,
      },
      '&:before': {
         display: 'none',
      },
      expanded: {
         margin: '0 0 0 0',
      },
   },
   expansionPanelSummary: {
      borderBottom: '0px solid rgba(0,0,0,.125)',
      margin: '0px 16px -1px 0px',
      height: 64,
      '&$expanded': {
         height: 64,
         margin: '12px 0',
         fontWeight: 500,
      },
      content: {
         '&$expanded': {
            margin: '12px 0',
         },
      },
      expanded: {
         minHeight: 64
      }
   },
   expansionPanelDetails: {
      padding: 0,
      display: 'block',
   },
   headerPanel: {
      fontSize: theme.typography.pxToRem(25),
      fontWeight: 500,
   },
   checkBox: {
      padding: '0px 24px 10px 24px',
   },
   checkboxName: {
      fontSize: '13px',
   },
   deleteButton: {
      margin: '0px 0px 3px 22px',
   }

});


class Members extends React.Component {
   state = {
      user: "none",
      title: "",
      message: "",
      expanded: true,
      isAdmin: false,
      isLeader: false,
      checkedAdmin: false,
      checkedSupervisor: false,
      checkedMembers: false,
      copySuccess: '',
   };

   open = async () => {
      try {
         await this.dialog.open();
         return true;
      } catch (error) {
         return false;
      }
   }

   // Accepting a new band member
   _onAccept = async (member) => {
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
      const pendingRef = firebase.firestore().doc(`bands/${this.props.band.id}/pending/${member.id}`);
      const userRef = firebase.firestore().doc(`users/${member.uid}`);

      // Confirm modal about accepting
      this.setState({
         title: "Accept new member",
         message: `Are you sure you want to accept ${member.user.displayName} as a member?`,
      });
      if (!await this.open()) return;

      // Add member to members collection
      await bandRef.collection('members').add({
         ref: userRef,
         uid: member.uid,
         status: "member",
      });

      // Update users band refs
      let userBandRefs = (await userRef.get()).data().bandRefs || [];
      await userBandRefs.push(bandRef);

      await userRef.update({
         bandRefs: userBandRefs,
         defaultBandRef: bandRef,
      });

      // Remove member from pending collection
      await pendingRef.delete();
   }


   // Rejecting request from new band member
   _onReject = async (member) => {
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/pending/${member.id}`);

      // Confirm modal about rejecting
      this.setState({
         title: "Reject new member",
         message: `Are you sure you want to reject ${member.user.displayName} as a member?`,
      });
      if (!await this.open()) return;

      // Remove member from bands member list 
      await memberRef.delete();
   };


   // Deleting a band (only possible as band leader)
   _onDeleteBand = async () => {
      let band = this.props.band;
      const bandRef = firebase.firestore().doc(`bands/${band.id}`);
      const userRef = firebase.firestore().doc(`users/${this.state.user}`);
      console.log(band);

      // Confirm modal about rejecting
      this.setState({
         title: "Delete your band",
         message: `Are you sure you want to delete ${band.name}?`,
      });
      if (!await this.open()) return;

      // Checking if user is band leader
      if (this.state.isLeader && band.creatorRef.id == this.state.user) {

         // Deleting scores from storage
         if (await band.score.length > 0) {
            console.log('Deleting scores not yet implemented')
         }

         // Deleting unsorted pdfs from storage
         if (await band.pdfs.length > 0) {
            console.log('Deleting unsorted pdfs not yet implemented')
         }

         // Removing bandRef 
         let userBandRefs = (await userRef.get()).data().bandRefs || [];
         let filteredRefs = await userBandRefs.filter(ref => ref.id !== bandRef.id);
         
         await userRef.update({
            bandRefs: filteredRefs,
            defaultBandRef: filteredRefs[0],
         });

         // Deleting band
         await bandRef.delete()
         console.log('Band deleted');
      }
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

      // Confirm modals about leaving
      this.setState({
         title: "Leave band",
      });
      if (member.admin && admins.length < 2 && members.length > 1) {
         this.setState({
            message: `You are the final admin of ${this.props.band.name}. To leave the band you have to promote someone else to admin first.`,
         });
         if (!await this.open()) return;
         return;
      } else if (members.length < 2) {
         this.setState({
            message: `Are you sure you want to leave ${this.props.band.name}? You are the last member of the band and this action will lead to the deletion of the band.`,
         });
         if (!await this.open()) return;
      } else {
         this.setState({
            message: `Are you sure you want to leave ${this.props.band.name}?`,
         });
         if (!await this.open()) return;
      }

      // Remove member from admin list if member was admin
      if (member.admin) {
         admins = admins.filter(admin => {
            return admin !== member.uid;
         });
         await bandRef.update({
            admins: admins,
         });
      }

      // Remove member from bands member list
      await memberRef.delete();

      // remove band from user bandRef list and update  defaultBandRef to the first element in bandRef list
      // if bandRef is empty then remove bandRef and defaultBandRef values
      // REMARK: adding/deleting things from an array in firebase is apparently a nono, better to use dictionary
      // see https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html

      const oldBandRefs = (await userRef.get()).data().bandRefs || [];
      const newBandRefs = [];
      const bandCode = (await bandRef.get()).data().code;
      for (let i in oldBandRefs) {
         const refCode = (await oldBandRefs[i].get()).data().code;
         if (refCode !== bandCode) {
            newBandRefs.push(oldBandRefs[i]);
         }
      }

      if (newBandRefs.length > 0) {
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
      if (members.length < 1) {
         await bandRef.delete();
      }
   }

   // Removing a member from the band
   _onRemove = async (member) => {
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
      const userRef = firebase.firestore().doc(`users/${member.uid}`);

      // confirm modal about removal
      this.setState({
         title: "Remove member",
         message: `Are you sure you want to remove ${member.user.displayName} from ${this.props.band.name}?`,
      });
      if (!await this.open()) return;

      // Remove member from bands member list
      await memberRef.delete();

      // same as onLeave, but removed by admin
      // remove band from user bandRef list and update  defaultBandRef to the first element in bandRef list
      // if bandRef is empty then remove bandRef and defaultBandRef values
      // REMARK: adding/deleting things from an array in firebase is apparently a nono, better to use dictionary
      // see https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html

      const oldBandRefs = (await userRef.get()).data().bandRefs || [];
      const newBandRefs = [];
      const bandCode = (await bandRef.get()).data().code;
      for (let i in oldBandRefs) {
         const refCode = (await oldBandRefs[i].get()).data().code;
         if (refCode !== bandCode) {
            newBandRefs.push(oldBandRefs[i]);
         }
      }

      if (newBandRefs.length > 0) {
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

      // TODO: Needs to update member about removal
   }

   // Setting member as admin
   _onMakeAdmin = async (member) => {
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`)
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

      // Confirm modal about promotion to admin
      this.setState({
         title: "Promote to admin",
         message: `Are you sure you want to promote ${member.user.displayName} to admin of ${this.props.band.name}?`,
      });
      if (!await this.open()) return;

      await memberRef.update({
         admin: true,
      });

      // Add member to the admin list
      let admins = (await bandRef.get()).data().admins || [];
      admins.push(member.uid);
      await bandRef.update({
         admins: admins,
      });
   }

   // Setting member as note manager
   _onMakeSupervisor = async (member) => {
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

      // Confirm modal about promotion to music supervisor
      this.setState({
         title: "Promotion",
         message: `Are you sure you want to promote ${member.user.displayName} to note manager of ${this.props.band.name}?`
      });
      if (!await this.open()) {
         return;
      }

      await memberRef.update({
         supervisor: true,
      });
   }

   // Demoting member from note manager
   _onDemoteSupervisor = async (member) => {
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

      // Confirm modal about demoting from music supervisor
      this.setState({
         title: "Demote note manager",
         message: `Are you sure you want to demote ${member.user.displayName} from note manager of ${this.props.band.name}?`,
      });
      if (!await this.open()) return;

      await memberRef.update({
         supervisor: false,
      });
   }

   // Demoting member from admin
   _onDemoteAdmin = async (member) => {
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

      this.setState({
         title: "Demote admin",
         message: `Are you sure you want to demote ${member.user.displayName} from admin of ${this.props.band.name}?`,
      });
      if (!await this.open()) return;

      await memberRef.update({
         admin: false,
      });
   }

   // Function when clicking checkbox
   handleCheckChange = name => event => {
      this.setState({ [name]: event.target.checked });
   };

   handleExpansionChange = panel => (event, expanded) => {
      this.setState({
         expanded: expanded ? panel : false,
      });
   };

   // Runs whenever an update happens
   componentDidUpdate(prevProp, prevState) {
      const { band } = this.props;
      if (band.id !== prevProp.band.id) {
         const { currentUser } = firebase.auth();
         this.setState({
            user: currentUser.uid,
         });

         firebase.firestore().doc(`bands/${this.props.band.id}`).get().then(snapshot => {
            const admins = snapshot.data().admins;
            const leader = snapshot.data().creatorRef.id;

            for (let i in admins) {
               if (currentUser.uid === admins[i]) {
                  this.setState({
                     isAdmin: true
                  })
               }
            }

            if (currentUser.uid === leader) {
               this.setState({
                  isLeader: true
               })
               return;
            }

            this.setState({
               isAdmin: false,
               isLeader: false,
            })
         });
      }
   }

   // Runs once when opening the page
   componentDidMount() {
      const { band } = this.props;

      const { currentUser } = firebase.auth();
      this.setState({
         user: currentUser.uid,
      });

      firebase.firestore().doc(`bands/${band.id}`).get().then(snapshot => {
         const admins = snapshot.data().admins;
         const leader = snapshot.data().creatorRef.id;

         for (let i in admins) {
            if (currentUser.uid === admins[i]) {
               this.setState({
                  isAdmin: true
               });
            };
         };

         if (currentUser.uid === leader) {
            this.setState({
               isLeader: true
            });
            return;
         };

         this.setState({
            isAdmin: false,
            isLeader: false,
         });
      });
   };

   render() {
      const { classes, band } = this.props;
      let noneChecked = (!this.state.checkedAdmin && !this.state.checkedMembers && !this.state.checkedSupervisor)

      if (this.state.isLeader) {
         return <div style={{ display: 'flex', justifyContent: 'space-between', width: 1100, paddingTop: 20, paddingLeft: 20 }}>
            {band.leader && band.leader.length > 0 &&
               <Paper style={{ width: 520 }}>
                  <ExpansionPanel className={classes.expansionPanel}>
                     <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.headerPanel}> {band.name} </Typography>
                     </ExpansionPanelSummary>
                     <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                        <Typography className={classes.secondaryHeading}>
                           Bandcode: {band.code}
                           <Tooltip title="Delete band"><IconButton className={classes.deleteButton} onClick={() => this._onDeleteBand()}><Delete /></IconButton></Tooltip>
                        </Typography>
                        <Typography className={classes.secondaryHeading}> Click boxes to filter the members list </Typography>
                        <FormGroup row className={classes.checkboxRow}>
                           <FormControlLabel
                              className={classes.checkBox}
                              control={
                                 <Checkbox
                                    className={classes.checkboxName}
                                    checked={this.state.checkedAdmin}
                                    onChange={this.handleCheckChange('checkedAdmin')}
                                    value="checkedAdmin"
                                 />}
                              label="Admin"
                           />
                           <FormControlLabel
                              className={classes.checkBox}
                              control={
                                 <Checkbox
                                    className={classes.checkboxName}
                                    checked={this.state.checkedSupervisor}
                                    onChange={this.handleCheckChange('checkedSupervisor')}
                                    value="checkedSupervisor"
                                 />}
                              label="Supervisor"
                           />
                           <FormControlLabel
                              className={classes.checkBox}
                              control={
                                 <Checkbox
                                    className={classes.checkboxName}
                                    checked={this.state.checkedMembers}
                                    onChange={this.handleCheckChange('checkedMembers')}
                                    value="checkedMembers"
                                 />}
                              label="No roles"
                           />
                        </FormGroup>
                     </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <Divider />

                  <List>
                     <ListSubheader className={classes.heading}> Band leader </ListSubheader>
                     {
                        band.leader.map((member, index) =>
                           <ListItem key={index} dense >
                              <Avatar src={member.user.photoURL} />
                              <ListItemText primary={member.user.displayName} />
                              {member.admin && <Tooltip title="Admin. Click to demote"><IconButton onClick={() => this._onDemoteAdmin(member)}><Star color="secondary" /></IconButton></Tooltip>}
                              {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                              {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                              {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                              {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                              {member.status !== 'pending' && member.uid !== this.state.user && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                           </ListItem>)
                     }
                  </List>

                  {band.members.length > 0 &&
                     <div>
                        <Divider />
                        <ExpansionPanel className={classes.expansionPanel} expanded={this.state.expanded} onChange={this.handleExpansionChange(!this.state.expanded)}>
                           <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                              <Typography className={classes.heading}> Members </Typography>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                              {noneChecked &&
                                 <List>
                                    {band.members.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin. Click to demote"><IconButton onClick={() => this._onDemoteAdmin(member)}><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedAdmin && this.state.checkedSupervisor &&
                                 <List>
                                    {band.allroles.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin. Click to demote"><IconButton onClick={() => this._onDemoteAdmin(member)}><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedAdmin && !this.state.checkedSupervisor &&
                                 <List>
                                    {band.admins.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin. Click to demote"><IconButton onClick={() => this._onDemoteAdmin(member)}><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedSupervisor && !this.state.checkedAdmin &&
                                 <List>
                                    {band.supervisors.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin. Click to demote"><IconButton onClick={() => this._onDemoteAdmin(member)}><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedMembers && band.onlymembers.length > 0 &&
                                 <List>
                                    {band.onlymembers.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin. Click to demote"><IconButton onClick={() => this._onDemoteAdmin(member)}><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }
                           </ExpansionPanelDetails>
                        </ExpansionPanel>
                     </div>
                  }

                  {band.pending.length > 0 &&
                     <div>
                        <Divider />
                        <List>
                           <ListSubheader className={classes.heading}> Pending </ListSubheader>
                           {band.pending.map((member, index) =>
                              <ListItem key={index} dense >
                                 <Avatar src={member.user.photoURL} />
                                 <ListItemText primary={member.user.displayName} />
                                 {member.status === 'pending' &&
                                    <div>
                                       <Tooltip title="Accept membership request"><IconButton onClick={() => this._onAccept(member)}><Done style={{ color: 'green' }} /></IconButton></Tooltip>
                                       <Tooltip title="Reject membership request"><IconButton onClick={() => this._onReject(member)}><Clear style={{ color: 'red' }} /></IconButton></Tooltip>
                                    </div>
                                 }
                              </ListItem>)
                           }
                        </List>
                     </div>
                  }
               </Paper>
            }
            <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
               <Typography variant="body1" >{this.state.message}</Typography>
            </AsyncDialog>
         </div>
      }

      else if (this.state.isAdmin) {
         return <div style={{ display: 'flex', justifyContent: 'space-between', width: 1100, paddingTop: 20, paddingLeft: 20 }}>
            {band.member && band.member.length > 0 &&
               <Paper style={{ width: 520 }}>
                  <ExpansionPanel className={classes.expansionPanel}>
                     <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.headerPanel}> {band.name} </Typography>
                     </ExpansionPanelSummary>
                     <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                        <Typography className={classes.secondaryHeading}> Click boxes to filter the members list </Typography>
                        <FormGroup row className={classes.checkboxRow}>
                           <FormControlLabel
                              className={classes.checkBox}
                              control={
                                 <Checkbox
                                    className={classes.checkboxName}
                                    checked={this.state.checkedAdmin}
                                    onChange={this.handleCheckChange('checkedAdmin')}
                                    value="checkedAdmin"
                                 />}
                              label="Admin"
                           />
                           <FormControlLabel
                              className={classes.checkBox}
                              control={
                                 <Checkbox
                                    className={classes.checkboxName}
                                    checked={this.state.checkedSupervisor}
                                    onChange={this.handleCheckChange('checkedSupervisor')}
                                    value="checkedSupervisor"
                                 />}
                              label="Supervisor"
                           />
                           <FormControlLabel
                              className={classes.checkBox}
                              control={
                                 <Checkbox
                                    className={classes.checkboxName}
                                    checked={this.state.checkedMembers}
                                    onChange={this.handleCheckChange('checkedMembers')}
                                    value="checkedMembers"
                                 />}
                              label="No roles"
                           />
                        </FormGroup>
                     </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <Divider />

                  <List>
                     <ListSubheader className={classes.heading}> Band leader </ListSubheader>
                     {
                        band.leader.map((member, index) =>
                           <ListItem key={index} dense >
                              <Avatar src={member.user.photoURL} />
                              <ListItemText primary={member.user.displayName} />
                              {member.admin && <Tooltip title="Admin"><IconButton><Star color="secondary" /></IconButton></Tooltip>}
                              {member.supervisor && <Tooltip title="Note manager"><IconButton><QueueMusic color="secondary" /></IconButton></Tooltip>}
                           </ListItem>)
                     }
                  </List>

                  {band.members.length > 0 &&
                     <div>
                        <Divider />
                        <ExpansionPanel className={classes.expansionPanel} expanded={this.state.expanded} onChange={this.handleExpansionChange(!this.state.expanded)}>
                           <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                              <Typography className={classes.heading}> Members </Typography>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                              {noneChecked &&
                                 <List>
                                    {band.members.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && !member.admin && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedAdmin && this.state.checkedSupervisor &&
                                 <List>
                                    {band.allroles.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && !member.admin && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedAdmin && !this.state.checkedSupervisor &&
                                 <List>
                                    {band.admins.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && !member.admin && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedSupervisor && !this.state.checkedAdmin &&
                                 <List>
                                    {band.supervisors.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && !member.admin && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedMembers && band.onlymembers.length > 0 &&
                                 <List>
                                    {band.onlymembers.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.admin && <Tooltip title="Make admin"><IconButton onClick={() => this._onMakeAdmin(member)}><Star /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Note manager. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.status === 'member' && !member.supervisor && <Tooltip title="Make note manager"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                          {member.status !== 'pending' && member.uid !== this.state.user && !member.admin && <Tooltip title="Remove from band"><IconButton onClick={() => this._onRemove(member)}><Clear /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }
                           </ExpansionPanelDetails>
                        </ExpansionPanel>
                     </div>
                  }

                  {band.pending.length > 0 &&
                     <div>
                        <Divider />
                        <List>
                           <ListSubheader className={classes.heading}> Pending </ListSubheader>
                           {band.pending.map((member, index) =>
                              <ListItem key={index} dense >
                                 <Avatar src={member.user.photoURL} />
                                 <ListItemText primary={member.user.displayName} />
                                 {member.status === 'pending' &&
                                    <div>
                                       <Tooltip title="Accept membership request"><IconButton onClick={() => this._onAccept(member)}><Done style={{ color: 'green' }} /></IconButton></Tooltip>
                                       <Tooltip title="Reject membership request"><IconButton onClick={() => this._onReject(member)}><Clear style={{ color: 'red' }} /></IconButton></Tooltip>
                                    </div>
                                 }
                              </ListItem>)
                           }
                        </List>
                     </div>
                  }
               </Paper>
            }
            <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
               <Typography variant="body1" >{this.state.message}</Typography>
            </AsyncDialog>
         </div>
      }

      else {
         return <div style={{ display: 'flex', justifyContent: 'space-between', width: 600, paddingTop: 20, paddingLeft: 20 }}>
            {band.members && band.members.length > 0 &&
               <Paper style={{ width: 500 }}>

                  <ExpansionPanel className={classes.expansionPanel}>
                     <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.headerPanel}> {band.name} </Typography>
                     </ExpansionPanelSummary>
                     <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                        <Typography className={classes.secondaryHeading}> Click boxes to filter the members list </Typography>
                        <FormGroup row className={classes.checkboxRow}>
                           <FormControlLabel
                              className={classes.checkBox}
                              control={
                                 <Checkbox
                                    className={classes.checkboxName}
                                    checked={this.state.checkedAdmin}
                                    onChange={this.handleCheckChange('checkedAdmin')}
                                    value="checkedAdmin"
                                 />}
                              label="Admin"
                           />
                           <FormControlLabel
                              className={classes.checkBox}
                              control={
                                 <Checkbox
                                    className={classes.checkboxName}
                                    checked={this.state.checkedSupervisor}
                                    onChange={this.handleCheckChange('checkedSupervisor')}
                                    value="checkedSupervisor"
                                 />}
                              label="Supervisor"
                           />
                           <FormControlLabel
                              className={classes.checkBox}
                              control={
                                 <Checkbox
                                    className={classes.checkboxName}
                                    checked={this.state.checkedMembers}
                                    onChange={this.handleCheckChange('checkedMembers')}
                                    value="checkedMembers"
                                 />}
                              label="No roles"
                           />
                        </FormGroup>
                     </ExpansionPanelDetails>
                  </ExpansionPanel>

                  <Divider />

                  <List>
                     <ListSubheader className={classes.heading}> Band leader </ListSubheader>
                     {
                        band.leader.map((member, index) =>
                           <ListItem key={index} dense >
                              <Avatar src={band.leader[0].user.photoURL} />
                              <ListItemText primary={member.user.displayName} />
                              {member.admin && <Tooltip title="Admin"><IconButton disabled><Star color="secondary" /></IconButton></Tooltip>}
                              {member.supervisor && <Tooltip title="Note manager"><IconButton disabled><QueueMusic color="secondary" /></IconButton></Tooltip>}
                           </ListItem>)
                     }
                  </List>

                  <Divider />

                  {band.members.length > 0 &&
                     <div>
                        <Divider />
                        <ExpansionPanel className={classes.expansionPanel} expanded={this.state.expanded} onChange={this.handleExpansionChange(!this.state.expanded)}>
                           <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                              <Typography className={classes.heading}> Members </Typography>
                           </ExpansionPanelSummary>
                           <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                              {noneChecked &&
                                 <List>
                                    {band.members.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton disabled><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Music supervisor"><IconButton disabled><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedAdmin && this.state.checkedSupervisor &&
                                 <List>
                                    {band.allroles.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton disabled><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Music supervisor"><IconButton disabled><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedAdmin && !this.state.checkedSupervisor &&
                                 <List>
                                    {band.admins.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton disabled><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Music supervisor"><IconButton disabled><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedSupervisor && !this.state.checkedAdmin &&
                                 <List>
                                    {band.supervisors.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton disabled><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Music supervisor"><IconButton disabled><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }

                              {this.state.checkedMembers && band.onlymembers.length > 0 &&
                                 <List>
                                    {band.onlymembers.map((member, index) =>
                                       <ListItem key={index} dense >
                                          <Avatar src={member.user.photoURL} />
                                          <ListItemText primary={member.user.displayName} />
                                          {member.admin && <Tooltip title="Admin"><IconButton disabled><Star color="secondary" /></IconButton></Tooltip>}
                                          {member.supervisor && <Tooltip title="Music supervisor"><IconButton disabled><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                          {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeave(member)}><RemoveCircle /></IconButton></Tooltip>}
                                       </ListItem>)
                                    }
                                 </List>
                              }
                           </ExpansionPanelDetails>
                        </ExpansionPanel>
                     </div>
                  }
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