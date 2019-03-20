import React from 'react';
import firebase from 'firebase';

import {withStyles} from "material-ui/styles";
import {
    Button, Card, CardContent, CardMedia, IconButton, List, ListItem, ListItemText, Paper,
    Typography 
} from "material-ui";
import {PlaylistAdd, QueueMusic, SortByAlpha, ViewList, ViewModule} from "material-ui-icons";
import DeleteIcon from 'material-ui-icons/Delete';
const styles = {
    root: {},
    card: {
        width: 250,
        height: 250,
        marginRight: 20,
        marginBottom: 20,
        cursor: 'pointer'
    },
    media: {
        height: 150,
    },
    flex: {
        flex: 1
    }
};
class Setlists extends React.Component {
    state = {
        listView: false
    };

    componentWillMount() {
        if (window.localStorage.getItem('setlistsListView')) {
            this.setState({listView: true});
        }
    }

    //Is called by the moduleView parent tag
    _onViewModuleClick = () => {
        window.localStorage.removeItem('setlistsListView');
        this.setState({listView: false});
    };

    //Is called by the viewList parent tag
    _onViewListClick = () => {
        window.localStorage.setItem('setlistsListView', 'true');
        this.setState({listView: true});
    };

    //Is called by the Card tag
    _onSetlistCreateClick = () => {
        this.props.onCreateSetlist();
    };

    //This function will delete a setlist
    _onSetlistDeleteClick = (setlistId) => {
        console.log(setlistId);
        const {band} = this.props;
        //Fetching setlist reference from firestore
        const setlistRef = firebase.firestore().doc(`bands/${band.id}`).collection('setlists').doc(setlistId);

        setlistRef.delete().then(() => {
            console.log("Document succesfully removed");
        }).catch((err) => {
            console.error("Error removing document", err);
        })
    }
    //TODO: Lag alfabetisk sortering
    _onSetlistSorting = () => {

    }

    //This function will take in a timestamp and display it in the correct date, hour and minute
    _formatedDate = (setlist) => {
        //Converting our timestamp to a date string object
        let dateString = setlist.toDate().toString();
        //Using the splice method to format the string in date, hours and minutes
        let formatedString = dateString.split('');
        //Splicing the interval we want to remove
        formatedString.splice(21,45);
        formatedString = formatedString.join('');
        return formatedString;
    }

    render() {
        
        const {classes, band} = this.props;
        const {listView} = this.state;

        const hasSetlists = band.setlists && band.setlists.length > 0;

        return <div>
            <div style={{display: 'flex', alignItems: 'center', padding: '0 24px', height: 56}}>
                <div className={classes.flex}/>

                <IconButton>
                    <SortByAlpha onClick={this._onSetlistSorting}/>
                </IconButton>

                {
                    listView &&
                    <IconButton onClick={this._onViewModuleClick}>
                        <ViewModule/>
                    </IconButton>
                }
                {
                    !listView &&
                    <IconButton onClick={this._onViewListClick}>
                        <ViewList/>
                    </IconButton>
                }
            </div>
            <div style={{padding: '0 24px'}}>
                {
                    listView && hasSetlists &&
                    <Paper>
                        <List>
                            {
                                 band.setlists.map((setlist, index) =>
                                    <ListItem key={index} dense button onClick={() => window.location.hash = `#/setlist/${band.id}${setlist.id}`}>
                                        <QueueMusic color='action'/>
                                        <ListItemText primary={setlist.title}/>
                                    </ListItem>
                                    )
                            }
                        </List>
                    </Paper>
                }
                {
                    !listView && hasSetlists &&
                    <div style={{display: 'flex', flexWrap: 'wrap'}}>
                        {band.setlists.map((setlist, index) =>
                            <Card key={index} className={classes.card} 
                                  elevation={1}>
                                <CardMedia
                                    className={classes.media}
                                    onClick={() => window.location.hash = `#/setlist/${band.id}${setlist.id}`}
                                    image="https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"
                                    title=""
                                />
                                <CardContent>
                                    <Typography variant="headline" component="h2">
                                        {setlist.title}
                                    </Typography>
                                    <Typography component="p">
                                        {/*Checking for date setlist.date, if that does not exist, then we don't get anything*/}
                                        {setlist.date && this._formatedDate(setlist.date)}
                                    </Typography>
                                    <IconButton style={{paddingBottom: '150px'}}>
                                        <DeleteIcon onClick={() => this._onSetlistDeleteClick(setlist.id)}/>
                                    </IconButton>
                                </CardContent>
                                
                            </Card>
                        )}
                    </div>
                }
            </div>
            <Button
                onClick={this._onSetlistCreateClick}
                variant="fab"
                color="secondary"
                style={{position: 'absolute', bottom: 32, right: 32}}
            >
                <PlaylistAdd/>
            </Button>
        </div>
    }
}


export default withStyles(styles)(Setlists);