import React from 'react';
import firebase from 'firebase';

import { withStyles } from "material-ui/styles";
import {
   Avatar, IconButton, List, ListItem, ListItemText, Paper, Typography, ListSubheader, ExpansionPanel, ExpansionPanelSummary,
   ExpansionPanelDetails, Divider, Checkbox, FormGroup, FormControlLabel, Menu, MenuItem, Button, FormControl, Select,
} from "material-ui";
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import MoreVertIcon from 'material-ui-icons/MoreVert';
import { Done, Clear, Star, RemoveCircle, QueueMusic } from 'material-ui-icons';
import AsyncDialog from '../../components/dialogs/AsyncDialog';
import Tooltip from 'material-ui/Tooltip';
import ChangeBandNameDialog from '../../components/dialogs/ChangeBandNameDialog';
import ChangeBandDescDialog from '../../components/dialogs/ChangeBandDescDialog';


const styles = theme => ({
   root: {
      width: '100%',
   },
   divBox: {
      display: 'flex',
      justifyContent: 'space-between',
      width: 500,
      paddingTop: 20,
      paddingLeft: 20,
      float: "left",
      position: 'relative',
   },
   heading: {
      color: 'rgba(0, 0, 0, 0.87)',
      fontSize: theme.typography.pxToRem(15),
      fontWeight: 500,
      flexBasis: '33.33%',
      flexShrink: 0,
      paddingLeft: '24px'
   },
   expansionHeading: {
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
      padding: '10px 24px 20px 24px',
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
      padding: '20px 0px 10px 24px',
   },
   checkBox: {
      padding: '0px 34px 10px 24px',
   },
   checkboxName: {
      fontSize: '13px',
   },
   seeMoreButton: {
      position: 'absolute',
      right: '24px',
      margin: '-8px 0px 0px 0px',
   },
   descButton: {
      margin: '10px 0px 20px 24px',
      backgroundColor: '#448AFF',
      color: 'white',
      fontSize: '12px',
   },
   chooseBandType: {
      margin: '10px 0px 20px 24px',
   },
   chooseBandTypeSelect: {
      fontSize: '13px',
   },
   dropDownMenu: {
      padding: '5px'
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
      anchorEl: null,
      bandtype: '',
      bandtypes: [],
   };

   open = async () => {
      try {
         await this.dialog.open();
         return true;
      } catch (error) {
         return false;
      }
   }

   // Opens see more button besides band name
   handleClickSeeMore = event => {
      this.setState({ anchorEl: event.currentTarget });
   };

   // Closes see more button besides band name
   handleCloseSeeMore = () => {
      this.setState({ anchorEl: null });
   };

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
         admin: false,
         supervisor: false,
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

   // Adding band description
   _onAddDescription = async () => {
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
      const { desc } = await this.changeDescDialog.open();
      if (desc) {
         await bandRef.update({
            description: desc
         })
      }
   };

   // Changing band name
   _onChangeBandName = async () => {
      this.setState({ anchorEl: null });
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
      const { name } = await this.changeNameDialog.open();
      await bandRef.update({
         name: name,
      })
   };

   // Changing band description
   _onChangeBandDesc = async () => {
      this.setState({ anchorEl: null });
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
      const { desc } = await this.changeDescDialog.open();
      if (desc) {
         await bandRef.update({
            description: desc
         })
         return;
      }

      await bandRef.update({
         description: firebase.firestore.FieldValue.delete()
      })
   };

   // Choosing or changing band type
   _onChooseBandType = async () => {
      this.setState({ anchorEl: null });
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
      bandRef.update({
         bandtype: null
      })
   };

   // Deleting a band (only possible as band leader)
   _onDeleteBand = async () => {
      this.setState({ anchorEl: null });

      const band = this.props.band;
      const bandRef = firebase.firestore().collection(`bands`).doc(`${band.id}`);
      const userRef = firebase.firestore().doc(`users/${this.state.user}`);

      // Confirm modal about rejecting
      this.setState({
         title: "Delete your band",
         message: `Are you sure you want to delete ${band.name}?`,
      });
      if (!await this.open()) return;

      // Checking if user is band leader
      if (this.state.isLeader && band.creatorRef.id === this.state.user) {

         // Deleting scores from storage
         if (await band.score && band.score.length > 0) {
            console.log('Deleting scores from storage not yet implemented')
         }

         // Deleting unsorted pdfs from storage
         if (await band.pdf && band.pdfs.length > 0) {
            console.log('Deleting unsorted pdfs from storage not yet implemented')
         }

         // Removing bandRef from user
         let userBandRefs = (await userRef.get()).data().bandRefs || [];
         let filteredRefs = await userBandRefs.filter(ref => ref.id !== bandRef.id);

         if (filteredRefs.length > 0) {
            await userRef.update({
               defaultBandRef: filteredRefs[0],
               bandRefs: filteredRefs,
            });
         }
         else {
            await userRef.update({
               defaultBandRef: firebase.firestore.FieldValue.delete(),
               bandRefs: firebase.firestore.FieldValue.delete(),
            });
         }

         // Removing bandRef from members
         await band.members.map(item => {
            let memberRef = firebase.firestore().doc(`users/${item.uid}`);
            memberRef.get().then(doc => {
               let memberBandRefs = doc.data().bandRefs || [];
               let filteredRefs = memberBandRefs.filter(ref => ref.id !== bandRef.id);
               
               if (filteredRefs.length > 0) {
                  memberRef.update({
                     defaultBandRef: filteredRefs[0],
                     bandRefs: filteredRefs,
                  });
               }
               else {
                  memberRef.update({
                     defaultBandRef: firebase.firestore.FieldValue.delete(),
                     bandRefs: firebase.firestore.FieldValue.delete(),
                  });
               }
            })
         })

         window.location.hash = `#/scores`;

         // Deleting the band and all its subcollections
         await this._onDeleteCollection(bandRef.collection('leader'), 20);
         await this._onDeleteCollection(bandRef.collection('members'), 50);
         await this._onDeleteCollection(bandRef.collection('pdfs'), 50);
         await this._onDeleteCollection(bandRef.collection('scores'), 50);
         await this._onDeleteCollection(bandRef.collection('setlists'), 50);
         await bandRef.delete();
      }
   }

   // Deleting collections with subcollections
   _onDeleteCollection = async (collectionPath, batchSize) => {
      var query = collectionPath;

      return new Promise((resolve, reject) => {
         this._onDeleteQueryBatch(query, batchSize, resolve, reject);
      });
   }

   // Deleting the subcollections one by one
   _onDeleteQueryBatch(query, batchSize, resolve, reject) {
      query.get()
         .then((snapshot) => {
            // When there are no documents left, we are done
            if (snapshot.size === 0) {
               return 0;
            }

            // Delete documents in a batch
            var batch = firebase.firestore().batch();
            snapshot.docs.forEach((doc) => {
               batch.delete(doc.ref);
            });

            return batch.commit().then(() => {
               return snapshot.size;
            });
         }).then((numDeleted) => {
            if (numDeleted === 0) {
               resolve();
               return;
            }

            // Recurse on the next process tick, to avoid
            // exploding the stack.
            process.nextTick(() => {
               this._onDeleteQueryBatch(query, batchSize, resolve, reject);
            });
         })
         .catch(reject);
   }

   // Member leaving the band
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
         message: `Are you sure you want to leave ${this.props.band.name}?`,
      });
      if (!await this.open()) return;

      // Remove member from admin list if member was admin
      if (member.admin) {
         admins = admins.filter(admin => {
            return admin !== member.uid;
         });
         await bandRef.update({
            admins: admins,
         });
      }

      // Remove member from band
      await memberRef.delete();

      // Remove band from user bandRef list and update defaultBandRef to the first element in bandRef list
      // If bandRef is empty then remove bandRef and defaultBandRef values
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
   }

   // Bandleader leaving band
   _onLeaveLeader = async (person) => {
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
      const leaderRef = firebase.firestore().doc(`bands/${this.props.band.id}/leader/${person.id}`);
      const userRef = firebase.firestore().doc(`users/${person.uid}`);

      let admins = (await bandRef.get()).data().admins;
      let members = [];
      let leaders = [];

      await bandRef.collection(`/members`).get().then(docs => {
         docs.forEach(doc => {
            members.push(doc.data());
         });
      });

      await bandRef.collection(`/leader`).get().then(docs => {
         docs.forEach(doc => {
            leaders.push(doc.data());
         });
      });

      // Confirm modals about leaving
      this.setState({
         title: "Leave band",
      });

      if (person.leader && leaders.length === 1 && members.length > 0) {
         this.setState({
            message: `You are the only bandleader of ${this.props.band.name}. To leave the band you have to promote someone else to bandleader first.`,
         });
         if (!await this.open()) return;
         return;
      }

      else if (person.leader && leaders.length === 1 && members.length === 0) {
         this.setState({
            message: `Are you sure you want to leave ${this.props.band.name}? 
            You are the last member of the band and this action will lead to the deletion of the band.`,
         });
         if (!await this.open()) return;
         this._onDeleteBand();
         return;
      }

      else {
         this.setState({
            message: `Are you sure you want to leave ${this.props.band.name}?`,
         });
         if (!await this.open()) return;
      }

      // Remove leader from admin list if member was admin
      if (person.admin) {
         admins = admins.filter(admin => {
            return admin !== person.uid;
         });
         await bandRef.update({
            admins: admins,
         });
      }

      // Remove member from bands member list
      await leaderRef.delete();

      // Remove band from user bandRef list and update defaultBandRef to the first element in bandRef list
      // If bandRef is empty then remove bandRef and defaultBandRef values
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
   };

   // Removing a member from the band
   _onRemove = async (member) => {
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`);
      const userRef = firebase.firestore().doc(`users/${member.uid}`);

      // Confirm modal about removal
      this.setState({
         title: "Remove member",
         message: `Are you sure you want to remove ${member.user.displayName} from ${this.props.band.name}?`,
      });
      if (!await this.open()) return;

      // Remove member from bands member list
      await memberRef.delete();

      // Same as onLeave, but removed by admin
      // Remove band from user bandRef list and update  defaultBandRef to the first element in bandRef list
      // If bandRef is empty then remove bandRef and defaultBandRef values
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

      if (this.state.checkedAdmin || this.state.checkedSupervisor || this.state.checkedMembers) {
         alert("You can't change premissions while filtering is on")
         return;
      }

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
      let admins = (await bandRef.get()).data().admins || {};
      if (!admins.includes(member.uid)) {
         admins.push(member.uid)
      }
      await bandRef.update({
         admins: admins,
      });
   }

   // Setting member as conductor
   _onMakeSupervisor = async (member) => {
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

      if (this.state.checkedAdmin || this.state.checkedSupervisor || this.state.checkedMembers) {
         alert("You can't change premissions while filtering is on")
         return;
      }

      // Confirm modal about promotion to conductor
      this.setState({
         title: "Promotion",
         message: `Are you sure you want to promote ${member.user.displayName} to conductor of ${this.props.band.name}?`
      });
      if (!await this.open()) {
         return;
      }

      await memberRef.update({
         supervisor: true,
      });
   }

   // Demoting member from conductor
   _onDemoteSupervisor = async (member) => {
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

      if (this.state.checkedAdmin || this.state.checkedSupervisor || this.state.checkedMembers) {
         alert("You can't change premissions while filtering is on")
         return;
      }

      // Confirm modal about demoting from conductor
      this.setState({
         title: "Demote conductor",
         message: `Are you sure you want to demote ${member.user.displayName} from conductor of ${this.props.band.name}?`,
      });
      if (!await this.open()) return;

      await memberRef.update({
         supervisor: false,
      });
   }

   // Demoting member from admin
   _onDemoteAdmin = async (member) => {
      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`)
      const memberRef = firebase.firestore().doc(`bands/${this.props.band.id}/members/${member.id}`)

      if (this.state.checkedAdmin || this.state.checkedSupervisor || this.state.checkedMembers) {
         alert("You can't change roles while filtering is on")
         return;
      }

      // Confirm modal about demoting member as admin
      this.setState({
         title: "Demote admin",
         message: `Are you sure you want to demote ${member.user.displayName} from admin of ${this.props.band.name}?`,
      });
      if (!await this.open()) return;

      // Updating admin status for member
      await memberRef.update({
         admin: false,
      });

      // Removing admin from band adminlist
      let admins = (await bandRef.get()).data().admins || [];
      let filteredAdmins = await admins.filter(ref => ref !== member.uid);

      if (filteredAdmins.length > 0) {
         await bandRef.update({
            admins: filteredAdmins,
         });
      }
   }

   // Function when clicking checkbox
   handleCheckChange = name => event => {
      this.setState({ [name]: event.target.checked });
   };

   // Expanding expansion panels
   handleExpansionChange = panel => (event, expanded) => {
      this.setState({
         expanded: expanded ? panel : false,
      });
   };

   // Selecting band type
   _onSelectChange = name => event => {
      this.setState({ [name]: event.target.value });

      const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
      bandRef.update({
         bandtype: event.target.value
      })
   };

   // Runs when changing to another band
   componentDidUpdate(prevProp, prevState) {
      const { band } = this.props;
      if (band.id !== prevProp.band.id) {
         const { currentUser } = firebase.auth();
         this.setState({
            user: currentUser.uid,
            isAdmin: false,
            isLeader: false,
         });

         firebase.firestore().doc(`bands/${band.id}`).get().then(snapshot => {
            const admins = (snapshot.data() === undefined) ? [] : snapshot.data().admins;
            const leader = (snapshot.data() === undefined) ? null : snapshot.data().creatorRef.id;

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
         });
      }
   }

   // Runs once when opening the page
   componentDidMount() {
      const { band } = this.props;

      const { currentUser } = firebase.auth();
      this.setState({
         user: currentUser.uid,
         band: band,
      });

      firebase.firestore().doc(`bands/${band.id}`).get().then(snapshot => {
         const admins = (snapshot.data() === undefined) ? [] : snapshot.data().admins;
         const leader = (snapshot.data() === undefined) ? null : snapshot.data().creatorRef.id;

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
         }
      });

      const types = [];
      const bandtypeRef = firebase.firestore().collection('bandtype');

      bandtypeRef.get()
         .then(docs => {
            docs.forEach(doc => {
               types.push(doc.data());
            });
         })
         .catch(err => {
            console.log('Error getting bandtypes', err);
         });

      this.setState({ bandtypes: types });
   };


   render() {
      const { classes, band } = this.props;
      const { anchorEl } = this.state;
      const open = Boolean(anchorEl);
      let noneChecked = (!this.state.checkedAdmin && !this.state.checkedMembers && !this.state.checkedSupervisor)

      if (this.state.isLeader) {
         return <div>
            <div className={classes.divBox}>
               {band.leader && band.leader.length > 0 &&
                  <Paper style={{ width: 500 }}>

                     <Typography id='band-name-title' className={classes.headerPanel}> {band.name}
                        <IconButton
                           id='see-more-band-button'
                           className={classes.seeMoreButton}
                           aria-label="See more"
                           aria-owns={open ? 'long-menu' : undefined}
                           aria-haspopup="true"
                           onClick={this.handleClickSeeMore}
                        >
                           <MoreVertIcon />
                        </IconButton>
                        <Menu
                           id="simple-menu"
                           anchorEl={anchorEl}
                           open={Boolean(anchorEl)}
                           onClose={this.handleCloseSeeMore}
                        >
                           <MenuItem id='change-bandName-button' onClick={this._onChangeBandName}>Change bandname</MenuItem>
                           <MenuItem id='change-bandType-button' onClick={this._onChooseBandType}>Change bandtype</MenuItem>
                           <MenuItem id='change-bandDesc-button' onClick={this._onChangeBandDesc}>Change description</MenuItem>
                           <MenuItem id='delete-band-button' onClick={this._onDeleteBand}>Delete band</MenuItem>
                        </Menu>
                     </Typography>

                     <Typography className={classes.heading} style={{ marginTop: '10px' }}> Bandcode </Typography>
                     <Typography className={classes.secondaryHeading}> {band.code} </Typography>

                     {band.bandtype &&
                        <div>
                           <Typography className={classes.heading}> Bandtype </Typography>
                           <Typography className={classes.secondaryHeading}> {band.bandtype} </Typography>
                        </div>
                     }

                     {!band.bandtype &&
                        <div>
                           <Typography className={classes.heading}> Choose bandtype </Typography>
                           <FormControl className={classes.chooseBandType}>
                              <Select
                                 className={classes.chooseBandTypeSelect}
                                 native
                                 value={this.state.bandtype}
                                 onChange={this._onSelectChange('bandtype')}
                                 inputProps={{
                                    name: 'bandtype',
                                 }}
                              >
                                 {this.state.bandtypes.map((type, index) =>
                                    <option key={index} value={type.name}> {type.name} </option>
                                 )}
                              </Select>
                           </FormControl>
                        </div>
                     }

                     {band.description &&
                        <div>
                           <Typography className={classes.heading}> Band description </Typography>
                           <Typography id='band-description-text' className={classes.secondaryHeading}> {band.description} </Typography>
                        </div>
                     }

                     {!band.description &&
                        <Button className={classes.descButton} onClick={this._onAddDescription}>
                           Add description
                        </Button>
                     }

                     <Divider />

                     <List>
                        <ListSubheader className={classes.heading}> Band leader </ListSubheader>
                        {
                           band.leader.map((member, index) =>
                              <ListItem key={index} dense >
                                 <Avatar src={member.user.photoURL} />
                                 <ListItemText primary={member.user.displayName} />
                                 {member.admin && <Tooltip title="Admin"><div><IconButton disabled><Star color="secondary" /></IconButton></div></Tooltip>}
                                 {member.supervisor && <Tooltip title="Conductor"><div><IconButton disabled><QueueMusic color="secondary" /></IconButton></div></Tooltip>}
                                 {member.uid === this.state.user && <Tooltip title="Leave band"><IconButton onClick={() => this._onLeaveLeader(member)}><RemoveCircle /></IconButton></Tooltip>}
                              </ListItem>)
                        }
                     </List>

                     {band.pending && band.pending.length > 0 &&
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', width: 500, paddingTop: 20, paddingLeft: 20 }}>
               {band.leader && band.leader.length > 0 &&
                  <Paper style={{ width: 500 }}>
                     <ExpansionPanel className={classes.expansionPanel}>
                        <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                           <Typography className={classes.expansionHeading}> Filter options </Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.expansionPanelDetails}>
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
                                 label="Conductor"
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

                     {band.members && band.members.length > 0 &&
                        <div>
                           <ExpansionPanel className={classes.expansionPanel} expanded={this.state.expanded} onChange={this.handleExpansionChange(!this.state.expanded)}>
                              <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                                 <Typography className={classes.expansionHeading}> Members </Typography>
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                  </Paper>
               }
            </div>

            <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
               <Typography variant="body1" >{this.state.message}</Typography>
            </AsyncDialog>
            <ChangeBandNameDialog onRef={ref => this.changeNameDialog = ref} />
            <ChangeBandDescDialog onRef={ref => this.changeDescDialog = ref} />
         </div >
      }

      else if (this.state.isAdmin) {
         return <div>
            <div className={classes.divBox}>
               {band.leader && band.leader.length > 0 &&
                  <Paper style={{ width: 500 }}>

                     <Typography id='band-name-title' className={classes.headerPanel}> {band.name}
                        <IconButton
                           id='see-more-band-button'
                           className={classes.seeMoreButton}
                           aria-label="See more"
                           aria-owns={open ? 'long-menu' : undefined}
                           aria-haspopup="true"
                           onClick={this.handleClickSeeMore}
                        >
                           <MoreVertIcon />
                        </IconButton>

                        <Menu
                           id="simple-menu"
                           anchorEl={anchorEl}
                           open={Boolean(anchorEl)}
                           onClose={this.handleCloseSeeMore}
                        >
                           <MenuItem onClick={this._onChooseBandType}>Change bandtype</MenuItem>
                           <MenuItem onClick={this._onChangeBandDesc}>Change description</MenuItem>
                        </Menu>
                     </Typography>

                     <Typography className={classes.heading} style={{ marginTop: '10px' }}> Bandcode </Typography>
                     <Typography className={classes.secondaryHeading}> {band.code} </Typography>

                     {band.bandtype &&
                        <div>
                           <Typography className={classes.heading}> Bandtype </Typography>
                           <Typography className={classes.secondaryHeading}> {band.bandtype} </Typography>
                        </div>
                     }

                     {!band.bandtype &&
                        <div>
                           <Typography className={classes.heading}> Choose bandtype </Typography>
                           <FormControl className={classes.chooseBandType}>
                              <Select
                                 className={classes.chooseBandTypeSelect}
                                 native
                                 value={this.state.bandtype}
                                 onChange={this._onSelectChange('bandtype')}
                                 inputProps={{
                                    name: 'bandtype',
                                 }}
                              >
                                 {this.state.bandtypes.map((type, index) =>
                                    <option key={index} value={type.name}> {type.name} </option>
                                 )}
                              </Select>
                           </FormControl>
                        </div>
                     }

                     {band.description &&
                        <div>
                           <Typography className={classes.heading}> Band description </Typography>
                           <Typography className={classes.secondaryHeading}> {band.description} </Typography>
                        </div>
                     }

                     {!band.description &&
                        <Button className={classes.descButton} onClick={this._onAddDescription}> Add description </Button>
                     }

                     <Divider />

                     <List>
                        <ListSubheader className={classes.heading}> Band leader </ListSubheader>
                        {
                           band.leader.map((member, index) =>
                              <ListItem key={index} dense >
                                 <Avatar src={member.user.photoURL} />
                                 <ListItemText primary={member.user.displayName} />
                                 {member.admin && <Tooltip title="Admin"><div><IconButton disabled><Star color="secondary" /></IconButton></div></Tooltip>}
                                 {member.supervisor && <Tooltip title="Conductor"><div><IconButton disabled><QueueMusic color="secondary" /></IconButton></div></Tooltip>}
                              </ListItem>)
                        }
                     </List>

                     {band.pending && band.pending.length > 0 &&
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', width: 500, paddingTop: 20, paddingLeft: 20 }}>
               {band.leader && band.leader.length > 0 &&
                  <Paper style={{ width: 500 }}>

                     <ExpansionPanel className={classes.expansionPanel}>
                        <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                           <Typography className={classes.expansionHeading}> Filter options </Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.expansionPanelDetails}>

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
                                 label="Conductor"
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

                     {band.members && band.members.length > 0 &&
                        <div>
                           <Divider />
                           <ExpansionPanel className={classes.expansionPanel} expanded={this.state.expanded} onChange={this.handleExpansionChange(!this.state.expanded)}>
                              <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                                 <Typography className={classes.expansionHeading}> Members </Typography>
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                                             {member.supervisor && <Tooltip title="Conductor. Click to demote"><IconButton onClick={() => this._onDemoteSupervisor(member)}><QueueMusic color="secondary" /></IconButton></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title="Make conductor"><IconButton onClick={() => this._onMakeSupervisor(member)}><QueueMusic /></IconButton></Tooltip>}
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
                  </Paper>
               }
            </div>

            <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
               <Typography variant="body1" >{this.state.message}</Typography>
            </AsyncDialog>
            <ChangeBandNameDialog onRef={ref => this.changeNameDialog = ref} />
            <ChangeBandDescDialog onRef={ref => this.changeDescDialog = ref} />
         </div >
      }

      else {
         return <div>
            <div className={classes.divBox}>
               {band.leader && band.leader.length > 0 &&
                  <Paper style={{ width: 500 }}>

                     <Typography id='band-name-title' className={classes.headerPanel}> {band.name} </Typography>

                     <Typography className={classes.heading} style={{ marginTop: '10px' }}> Bandcode </Typography>
                     <Typography className={classes.secondaryHeading}> {band.code} </Typography>

                     {band.bandtype &&
                        <div>
                           <Typography className={classes.heading}> Bandtype </Typography>
                           <Typography className={classes.secondaryHeading}> {band.bandtype} </Typography>
                        </div>
                     }

                     {!band.bandtype &&
                        <div>
                           <Typography className={classes.heading}> Bandtype </Typography>
                           <Typography className={classes.secondaryHeading}> Ikke spesifisert enda </Typography>
                        </div>
                     }

                     {band.description &&
                        <div>
                           <Typography className={classes.heading}> Band description </Typography>
                           <Typography className={classes.secondaryHeading}> {band.description} </Typography>
                        </div>
                     }

                     {!band.description &&
                        <div>
                           <Typography className={classes.heading}> Band description </Typography>
                           <Typography className={classes.secondaryHeading}> Ikke spesifisert enda </Typography>
                        </div>
                     }

                     <Divider />

                     <List>
                        <ListSubheader className={classes.heading}> Band leader </ListSubheader>
                        {
                           band.leader.map((member, index) =>
                              <ListItem key={index} dense >
                                 <Avatar src={member.user.photoURL} />
                                 <ListItemText primary={member.user.displayName} />
                                 {member.admin && <Tooltip title="Admin"><div><IconButton disabled><Star color="secondary" /></IconButton></div></Tooltip>}
                                 {member.supervisor && <Tooltip title="Conductor"><div><IconButton disabled><QueueMusic color="secondary" /></IconButton></div></Tooltip>}
                              </ListItem>)
                        }
                     </List>

                  </Paper>
               }
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', width: 500, paddingTop: 20, paddingLeft: 20 }}>
               {band.leader && band.leader.length > 0 &&
                  <Paper style={{ width: 500 }}>

                     <ExpansionPanel className={classes.expansionPanel}>
                        <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                           <Typography className={classes.expansionHeading}> Filter options </Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.expansionPanelDetails}>

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
                                 label="Conductor"
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

                     {band.members && band.members.length > 0 &&
                        <div>
                           <Divider />
                           <ExpansionPanel className={classes.expansionPanel} expanded={this.state.expanded} onChange={this.handleExpansionChange(!this.state.expanded)}>
                              <ExpansionPanelSummary className={classes.expansionPanelSummary} expandIcon={<ExpandMoreIcon />}>
                                 <Typography className={classes.expansionHeading}> Members </Typography>
                              </ExpansionPanelSummary>
                              <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                                 {noneChecked &&
                                    <List>
                                       {band.members.map((member, index) =>
                                          <ListItem key={index} dense >
                                             <Avatar src={member.user.photoURL} />
                                             <ListItemText primary={member.user.displayName} />
                                             {member.admin && <Tooltip title="Admin"><div><IconButton disabled><Star color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.admin && <Tooltip title=""><div><IconButton disabled><Star /></IconButton></div></Tooltip>}
                                             {member.supervisor && <Tooltip title="Conductor"><div><IconButton disabled><QueueMusic color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title=""><div><IconButton disabled><QueueMusic /></IconButton></div></Tooltip>}
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
                                             {member.admin && <Tooltip title="Admin"><div><IconButton disabled><Star color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.admin && <Tooltip title=""><div><IconButton disabled><Star /></IconButton></div></Tooltip>}
                                             {member.supervisor && <Tooltip title="Conductor"><div><IconButton disabled><QueueMusic color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title=""><div><IconButton disabled><QueueMusic /></IconButton></div></Tooltip>}
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
                                             {member.admin && <Tooltip title="Admin"><div><IconButton disabled><Star color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.admin && <Tooltip title=""><div><IconButton disabled><Star /></IconButton></div></Tooltip>}
                                             {member.supervisor && <Tooltip title="Conductor"><div><IconButton disabled><QueueMusic color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title=""><div><IconButton disabled><QueueMusic /></IconButton></div></Tooltip>}
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
                                             {member.admin && <Tooltip title="Admin"><div><IconButton disabled><Star color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.admin && <Tooltip title=""><div><IconButton disabled><Star /></IconButton></div></Tooltip>}
                                             {member.supervisor && <Tooltip title="Conductor"><div><IconButton disabled><QueueMusic color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title=""><div><IconButton disabled><QueueMusic /></IconButton></div></Tooltip>}
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
                                             {member.admin && <Tooltip title="Admin"><div><IconButton disabled><Star color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.admin && <Tooltip title=""><div><IconButton disabled><Star /></IconButton></div></Tooltip>}
                                             {member.supervisor && <Tooltip title="Conductor"><div><IconButton disabled><QueueMusic color="secondary" /></IconButton></div></Tooltip>}
                                             {member.status === 'member' && !member.supervisor && <Tooltip title=""><div><IconButton disabled><QueueMusic /></IconButton></div></Tooltip>}
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
            </div>

            <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
               <Typography variant="body1" >{this.state.message}</Typography>
            </AsyncDialog>
            <ChangeBandNameDialog onRef={ref => this.changeNameDialog = ref} />
            <ChangeBandDescDialog onRef={ref => this.changeDescDialog = ref} />

         </div >
      }
   }
}


export default withStyles(styles)(Members);