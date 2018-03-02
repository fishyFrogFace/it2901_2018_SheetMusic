import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {Button, Card, CardContent, CardMedia, IconButton, Menu, MenuItem, Snackbar,} from "material-ui";
import AddIcon from 'material-ui-icons/Add';
import MenuIcon from 'material-ui-icons/Menu';

import firebase from 'firebase';
import CreateBandDialog from "../components/dialogs/CreateBandDialog";
import JoinBandDialog from "../components/dialogs/JoinBandDialog";

export const signOut = async () => {
    await firebase.auth().signOut();
    window.location.reload();
};

const styles = {
    root: {},
    flex: {
        flex: 1
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
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: 24
    }
};


class Home extends Component {
    state = {
        anchorEl: null,
        bands: [],
        message: null
    };

    componentWillMount() {
        this.unsubscribe = firebase.firestore().collection(`users/${this.props.user.uid}/bands`).onSnapshot(async snapshot => {
            const bands = await Promise.all(snapshot.docs.map(async doc => {
                const bandDoc = await doc.data().ref.get();
                return {id: bandDoc.id, ...bandDoc.data()};
            }));

            this.setState({bands: bands});
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    _onAddButtonClick(e) {
        this.setState({anchorEl: e.currentTarget});
    }

    _onMenuClose() {
        this.setState({anchorEl: null});
    }

    async _onMenuClick(type) {
        const uid = this.props.user.uid;

        this.setState({anchorEl: null});

        switch (type) {
            case 'create':
                const {name} = await this.createDialog.open();

                try {
                    const band = {
                        name: name,
                        creator: firebase.firestore().doc(`users/${uid}`),
                        code: Math.random().toString(36).substring(2, 7)
                    };

                    let ref = await firebase.firestore().collection('bands').add(band);

                    const instrumentIds = (await firebase.firestore().collection('instruments').get()).docs.map(doc => doc.id);
                    await Promise.all(
                        instrumentIds.map(id =>
                            ref.collection('instruments').add({ref: firebase.firestore().doc(`instruments/${id}`)}))
                    );

                    await firebase.firestore().collection(`users/${uid}/bands`).add({
                        ref: firebase.firestore().doc(`bands/${ref.id}`)
                    });
                    window.location.hash = `#/band/${ref.id}`;
                } catch (err) {
                    console.log(err);
                }
                break;
            case 'join':
                const {code} = await this.joinDialog.open();

                let bandSnapshot = await firebase.firestore().collection('bands').where('code', '==', code).get();

                if (bandSnapshot.docs.length > 0) {
                    let docRef = firebase.firestore().doc(`bands/${bandSnapshot.docs[0].id}`);

                    let userBandSnapshot = await firebase.firestore().collection(`users/${uid}/bands`).where('ref', '==', docRef).get();

                    if (userBandSnapshot.docs.length > 0) {
                        this.setState({message: 'Band already joined!'});
                    } else {
                        await firebase.firestore().collection(`users/${uid}/bands`).add({ref: docRef});
                        await docRef.collection('members').add({ref: firebase.firestore().doc(`users/${uid}`)});
                        window.location.hash = `#/band/${docRef.id}`;
                    }
                } else {
                    this.setState({message: 'Band does not exist!'});
                }
                break;
        }
    }

    _onMenuButtonClick() {

    }

    render() {
        const {anchorEl, bands, message} = this.state;
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton color="inherit" onClick={() => this._onMenuButtonClick()}>
                            <MenuIcon/>
                        </IconButton>
                        <Typography variant="title" color="inherit" className={classes.flex}>
                            ScoreButler
                        </Typography>
                        <Button onClick={() => signOut()} style={{color: 'white'}}>Sign Out</Button>
                        <IconButton color="inherit" onClick={e => this._onAddButtonClick(e)}>
                            <AddIcon/>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => this._onMenuClose()}
                        >
                            <MenuItem onClick={() => this._onMenuClick('create')}>Create Band</MenuItem>
                            <MenuItem onClick={() => this._onMenuClick('join')}>Join Band</MenuItem>
                        </Menu>
                    </Toolbar>
                </AppBar>
                <div className={classes.grid}>
                    {bands.map((band, index) =>
                        <Card key={index} className={classes.card}
                              onClick={() => window.location.hash = `#/band/${band.id}`} elevation={1}>
                            <CardMedia
                                className={classes.media}
                                image="https://4.bp.blogspot.com/-vq0wrcE-1BI/VvQ3L96sCUI/AAAAAAAAAI4/p2tb_hJnwK42cvImR4zrn_aNly7c5hUuQ/s1600/BandPeople.jpg"
                                title=""
                            />
                            <CardContent>
                                <Typography variant="headline" component="h2">
                                    {band.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <CreateBandDialog onRef={ref => this.createDialog = ref}/>
                <JoinBandDialog onRef={ref => this.joinDialog = ref}/>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={Boolean(message)}
                    message={message}
                    autoHideDuration={3000}
                    onClose={() => this.setState({message: null})}
                />
            </div>
        );
    }
}


export default withStyles(styles)(Home);