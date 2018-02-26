import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {
    Avatar, Card, CardContent, CardMedia, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Paper, Tab,
    Tabs,
} from "material-ui";
import AddIcon from 'material-ui-icons/Add';
import MenuIcon from 'material-ui-icons/Menu';

import firebase from 'firebase';
import CreateSetlistDialog from "../components/dialogs/CreateSetlistDialog";
import CreateScoreDialog from "../components/dialogs/CreateScoreDialog";

import Drawer from '../components/Drawer.js';

const styles = {
    root: {},
    flex: {
        flex: 1
    },

    appBar: {
        flexWrap: 'wrap',
    },

    dialogContent: {
        display: 'flex',
        flexDirection: 'column'
    },
    card: {
        width: 270,
        marginRight: 24,
        marginBottom: 24,
        cursor: 'pointer'
    },
    media: {
        height: 150,
    },
    banner: {
        background: 'url(https://4.bp.blogspot.com/-vq0wrcE-1BI/VvQ3L96sCUI/AAAAAAAAAI4/p2tb_hJnwK42cvImR4zrn_aNly7c5hUuQ/s1600/BandPeople.jpg) center center no-repeat',
        backgroundSize: 'cover',
        height: 144
    },

    content: {
        paddingTop: 112
    },

    pageContainer: {
        display: 'flex',
        paddingTop: 20,
        justifyContent: 'center'
    }
};

class Band extends Component {
    state = {
        anchorEl: null,
        selectedPage: 1,
        band: {}
    };

    componentWillMount() {
        const bandId = this.props.detail;

        firebase.firestore().doc(`bands/${bandId}`).get().then(doc => {
            this.setState({band: doc.data()});
        });

        this._unsubscribeScores = firebase.firestore().collection(`bands/${bandId}/scores`).onSnapshot(async snapshot => {
            const scores = await Promise.all(snapshot.docs.map(async doc => {
                const arrDoc = await doc.data().ref.get();
                return {id: arrDoc.id, ...arrDoc.data()};
            }));

            this.setState({band: {...this.state.band, scores: scores}});
        });

        this._unsubscribeMembers = firebase.firestore().collection(`bands/${bandId}/members`).onSnapshot(async snapshot => {
            const members = await Promise.all(snapshot.docs.map(async doc => {
                const memberDoc = await doc.data().ref.get();
                return {id: memberDoc.id, ...memberDoc.data()};
            }));

            this.setState({band: {...this.state.band, members: members}});
        });
    }

    componentWillUnmount() {
        this._unsubscribeScores();
        this._unsubscribeMembers();
    }

    _onAddButtonClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }

    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    async _onMenuClick(type) {
        let uid = this.props.user.uid;
        let bandId = this.props.detail;

        this.setState({anchorEl: null});

        switch (type) {
            case 'score':
                const {title, composer} = await this.scoreDialog.open();

                try {
                    const score = {
                        title: title,
                        composer: composer,
                        creator: firebase.firestore().doc(`users/${uid}`),
                        band: firebase.firestore().doc(`bands/${bandId}`)
                    };

                    let ref = await firebase.firestore().collection('scores').add(score);

                    await firebase.firestore().collection(`bands/${bandId}/scores`).add({
                        ref: firebase.firestore().doc(`scores/${ref.id}`)
                    });
                    window.location.hash = `#/score/${ref.id}`;
                } catch (err) {
                    console.log(err);
                }
                break;
            case 'setlist':
                const {name} = await this.setlistDialog.open();
                break;
            default:
                break;
        }
    }

    _onTabsChange(e, value) {
        this.setState({selectedPage: value});
    }

    render() {
        const {anchorEl, selectedPage, band} = this.state;

        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <Drawer onSignOut={() => this.signOut()} bands={this.state.bands}/>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            {band.name}
                        </Typography>
                        <IconButton color="inherit" onClick={e => this._onAddButtonClick(e)}>
                            <AddIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => this._onMenuClose()}
                        >
                            <MenuItem onClick={() => this._onMenuClick('score')}>Create Score</MenuItem>
                            <MenuItem onClick={() => this._onMenuClick('setlist')}>Create Setlist</MenuItem>
                        </Menu>
                    </Toolbar>
                    <Tabs
                        centered
                        value={selectedPage}
                        onChange={(e, value) => this._onTabsChange(e, value)}
                        indicatorColor='white'
                    >
                        <Tab label='Home'/>
                        <Tab label='Scores'/>
                        <Tab label='Setlists'/>
                        <Tab label='Members'/>
                    </Tabs>
                </AppBar>
                <div className={classes.content}>
                    {(() => {
                        switch (selectedPage) {
                            case 0:
                                return <div>
                                    <div className={classes.banner}></div>
                                </div>;
                            case 1:
                                return <div className={classes.pageContainer}>
                                    <div style={{display: 'flex', width: 600, flexWrap: 'wrap'}}>
                                        {band.scores && band.scores.map((arr, index) =>
                                            <Card key={index} className={classes.card}
                                                  onClick={() => window.location.hash = `#/score/${arr.id}`}
                                                  elevation={1}>
                                                <CardMedia
                                                    className={classes.media}
                                                    image="https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"
                                                    title=""
                                                />
                                                <CardContent>
                                                    <Typography variant="headline" component="h2">
                                                        {arr.title}
                                                    </Typography>
                                                    <Typography component="p">
                                                        {arr.composer}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </div>;
                            case 2:
                                return <div className={classes.pageContainer}>Setlists</div>;
                            case 3:
                                return <div className={classes.pageContainer}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', width: 600}}>
                                        <Paper style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0 15px',
                                            width: 150,
                                            height: 50
                                        }}>
                                            <Typography variant='body1'>
                                                Band code
                                            </Typography>
                                            <Typography variant='body1'>
                                                <b>{band.code}</b>
                                            </Typography>
                                        </Paper>
                                        <Paper style={{width: 400}}>
                                            <List>
                                                {band.members && band.members.map((member, index) =>
                                                    <ListItem key={index} dense button>
                                                        <Avatar alt="Remy Sharp" src={member.photoURL}/>
                                                        <ListItemText primary={member.displayName}/>
                                                    </ListItem>)}
                                            </List>
                                        </Paper>
                                    </div>
                                </div>;
                        }
                    })()}
                </div>
                <CreateScoreDialog onRef={ref => this.scoreDialog = ref}/>
                <CreateSetlistDialog onRef={ref => this.setlistDialog = ref}/>
            </div>
        );
    }
}


export default withStyles(styles)(Band);
