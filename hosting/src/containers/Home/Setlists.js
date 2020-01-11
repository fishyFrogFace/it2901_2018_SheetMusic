/**
 * This class is called when a user clicks on the setlists tab
 * It has the following functionality:
 * Creating and deleting setlists
 * Sorting setlists
 * Setlist listview
 */

import React from 'react';
import firebase from 'firebase';

import { withStyles } from '@material-ui/core/styles';
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography,
} from '@material-ui/core';
import {
    PlaylistAdd,
    QueueMusic,
    SortByAlpha,
    ViewList,
    ViewModule,
} from '@material-ui/icons';
import DeleteIcon from '@material-ui/icons/Delete';
import AsyncDialog from '../../components/dialogs/AsyncDialog';
const styles = {
    root: {},
    card: {
        width: 250,
        height: 250,
        marginRight: 20,
        marginBottom: 20,
        cursor: 'pointer',
    },
    media: {
        height: 150,
    },
    flex: {
        flex: 1,
    },
};
class Setlists extends React.Component {
    state = {
        listView: false,
        sortedAlphabetically: false,
        title: '',
        message: '',
        hasRights: false,
    };

    open = async () => {
        try {
            await this.dialog.open();
            return true;
        } catch (error) {
            return false;
        }
    };

    componentWillMount() {
        if (window.localStorage.getItem('setlistsListView')) {
            this.setState({ listView: true });
        }
    }

    //This function updates the state of hasRights
    componentDidMount() {
        const { band } = this.props;
        const { currentUser } = firebase.auth();
        const bandRef = firebase.firestore().doc(`bands/${band.id}`);
        this.setState({
            user: currentUser.uid,
            hasRights: false,
        });

        //Looping through members, if a member is an admin or supervisor, the state will be updated
        bandRef.collection('members').onSnapshot(async snapshot => {
            const members = await Promise.all(
                snapshot.docs.map(async doc => ({
                    ...doc.data(),
                    ref: doc.ref,
                }))
            );
            for (let i in members) {
                if (currentUser.uid === members[i].uid) {
                    if (members[i].admin || members[i].supervisor) {
                        this.setState({
                            hasRights: true,
                        });
                    }
                }
            }
        });

        //If a user is the leader, the state will be updated
        bandRef.get().then(snapshot => {
            const leader =
                snapshot.data() === undefined
                    ? null
                    : snapshot.data().creatorRef.id;

            if (currentUser.uid === leader) {
                this.setState({
                    hasRights: true,
                });
                return;
            }
        });
    }

    //This function does the same as the one above, although is called when the component updates
    componentDidUpdate(prevProp, prevState) {
        const { band } = this.props;

        if (band.id !== prevProp.band.id) {
            const { currentUser } = firebase.auth();
            this.setState({
                user: currentUser.uid,
                hasRights: false,
            });
            const bandRef = firebase.firestore().doc(`bands/${band.id}`);

            bandRef.collection('members').onSnapshot(async snapshot => {
                const members = await Promise.all(
                    snapshot.docs.map(async doc => ({
                        ...doc.data(),
                        ref: doc.ref,
                    }))
                );

                for (let i in members) {
                    if (currentUser.uid === members[i].uid) {
                        if (members[i].admin || members[i].supervisor) {
                            this.setState({
                                hasRights: true,
                            });
                        }
                    }
                }
            });

            bandRef.get().then(snapshot => {
                const leader =
                    snapshot.data() === undefined
                        ? null
                        : snapshot.data().creatorRef.id;
                if (currentUser.uid === leader) {
                    this.setState({
                        hasRights: true,
                    });
                    return;
                }
            });
        }
    }

    //Is called by the moduleView parent tag
    _onViewModuleClick = () => {
        window.localStorage.removeItem('setlistsListView');
        this.setState({ listView: false });
    };

    //Is called by the viewList parent tag
    _onViewListClick = () => {
        window.localStorage.setItem('setlistsListView', 'true');
        this.setState({ listView: true });
    };

    //This function call the function onCreateSetlist with props
    _onSetlistCreateClick = () => {
        this.props.onCreateSetlist();
    };

    //This function takes in a setlistID and deletes the specified setlist
    _onSetlistDeleteClick = async (setlistId, setlistTitle) => {
        // Confirm modal for deleting
        this.setState({
            title: 'Delete this setlist',
            message: `Are you sure you want to delete ${setlistTitle}?`,
        });

        if (!(await this.open())) return;

        const { band } = this.props;
        //Fetching setlist reference from firestore
        const setlistRef = firebase
            .firestore()
            .doc(`bands/${band.id}`)
            .collection('setlists')
            .doc(setlistId);
        if (this.state.hasRights) {
            setlistRef
                .delete()
                .then(() => {})
                .catch(err => {
                    console.error('Error removing document', err);
                });
        }
    };

    //This function changes the boolean value of sortedAlphabetically
    _onSortByAlphaClick = () => {
        //Takes in the state
        let alpha = this.state.sortedAlphabetically;
        //Inverts the alpha
        alpha = !alpha;
        this.setState({ sortedAlphabetically: alpha });
    };

    //This function checks that setlistDate is a string, if so returns it and a space
    _formatedDate = setlistDate => {
        if (typeof setlistDate === 'string') {
            return setlistDate + ' ';
        }
    };

    //This function checks that setlistTime is a string, if so returns it
    _formatedTime = setlistTime => {
        if (typeof setlistTime === 'string') {
            return setlistTime;
        }
    };

    render() {
        const { classes, band } = this.props;
        const { listView } = this.state;
        const hasSetlists = band.setlists && band.setlists.length > 0;
        let setlists = [];

        if (this.state.sortedAlphabetically && hasSetlists) {
            setlists = band.setlists.slice();
            //Sorting the setlists alphabetically
            setlists = setlists
                .sort((a, b) => a.title.localeCompare(b.title))
                .slice();
        } else if (hasSetlists) {
            setlists = band.setlists.slice();
        }

        return (
            <div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 24px',
                        height: 56,
                    }}
                >
                    <div className={classes.flex} />

                    <IconButton id="sort-by-alpha-button">
                        <SortByAlpha onClick={this._onSortByAlphaClick} />
                    </IconButton>

                    {listView && (
                        <IconButton
                            onClick={this._onViewModuleClick}
                            id="view-module-button"
                        >
                            <ViewModule />
                        </IconButton>
                    )}
                    {!listView && (
                        <IconButton
                            onClick={this._onViewListClick}
                            id="wiew-list-button"
                        >
                            <ViewList />
                        </IconButton>
                    )}
                </div>
                <div style={{ padding: '0 24px' }}>
                    {listView && hasSetlists && (
                        <Paper>
                            <List>
                                {setlists.map((setlist, index) => (
                                    <ListItem
                                        key={index}
                                        dense
                                        button
                                        onClick={() =>
                                            (window.location.hash = `#/setlist/${band.id}${setlist.id}`)
                                        }
                                    >
                                        <QueueMusic color="action" />
                                        <ListItemText primary={setlist.title} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    )}
                    {!listView && hasSetlists && (
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {setlists.map((setlist, index) => (
                                <Card
                                    key={index}
                                    className={classes.card}
                                    id={'setlist-card'}
                                    elevation={1}
                                >
                                    {
                                        <CardMedia
                                            className={classes.media}
                                            onClick={() =>
                                                (window.location.hash = `#/setlist/${band.id}${setlist.id}`)
                                            }
                                            image="https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"
                                            title=""
                                        />
                                    }
                                    {
                                        <CardContent
                                            style={{ position: 'relative' }}
                                            id="setlist-card-content"
                                        >
                                            <Typography
                                                variant="headline"
                                                component="h2"
                                                id="setlist-card-typography"
                                            >
                                                {setlist.title}
                                                {this.state.hasRights && (
                                                    <IconButton
                                                        style={{
                                                            position:
                                                                'absolute',
                                                            right: '15px',
                                                        }}
                                                        id="setlist-delete-button"
                                                    >
                                                        <DeleteIcon
                                                            onClick={() =>
                                                                this._onSetlistDeleteClick(
                                                                    setlist.id,
                                                                    setlist.title
                                                                )
                                                            }
                                                        />
                                                    </IconButton>
                                                )}
                                            </Typography>
                                            <Typography component="p">
                                                {/*Checking for date setlist.date, if that does not exist, then we don't display anything*/}
                                                {setlist.date &&
                                                    this._formatedDate(
                                                        setlist.date
                                                    )}
                                                {setlist.time &&
                                                    this._formatedTime(
                                                        setlist.time
                                                    )}
                                            </Typography>
                                        </CardContent>
                                    }
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
                {this.state.hasRights && (
                    <Button
                        onClick={this._onSetlistCreateClick}
                        variant="fab"
                        color="secondary"
                        style={{ position: 'absolute', bottom: 32, right: 32 }}
                    >
                        <PlaylistAdd id="playlist-add-button" />
                    </Button>
                )}
                <AsyncDialog
                    title={this.state.title}
                    onRef={ref => (this.dialog = ref)}
                >
                    <Typography variant="body1">
                        {this.state.message}
                    </Typography>
                </AsyncDialog>
            </div>
        );
    }
}

export default withStyles(styles)(Setlists);
