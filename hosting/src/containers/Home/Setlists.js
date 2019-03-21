import React from 'react';
import firebase from 'firebase';

import {withStyles} from "material-ui/styles";
import {
    Button, Card, CardContent, CardMedia, IconButton, List, ListItem, ListItemText, Paper,
    Typography 
} from "material-ui";
import {PlaylistAdd, QueueMusic, SortByAlpha, ViewList, ViewModule} from "material-ui-icons";
import DeleteIcon from 'material-ui-icons/Delete';
import AsyncDialog from '../../components/dialogs/AsyncDialog';
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
        listView: false,
        sortedAlphabetically: false,
        title: "",
        message: "",
    };

    
    open = async () => {
        try {
           await this.dialog.open();
           return true;
        } catch (error) {
           return false;
        }
    }
    /*
    open = () => {
        this.dialog.open();
    }*/

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

    //This function call the function onCreateSetlist with
    _onSetlistCreateClick = () => {
        this.props.onCreateSetlist();
    };

    //This function takes in a setlistID and deletes the specified setlist
    _onSetlistDeleteClick = async (setlistId, setlistTitle) => {
        // Confirm modal for deleting
        this.setState({
            title: "Delete this setlist",
            message: `Are you sure you want to delete ${setlistTitle}?`,
        });

        if (!await this.open()) return;

        //console.log(setlistId);
        const {band} = this.props;
        //Fetching setlist reference from firestore
        const setlistRef = firebase.firestore().doc(`bands/${band.id}`).collection('setlists').doc(setlistId);

        setlistRef.delete().then(() => {
            console.log("Document succesfully removed");
        }).catch((err) => {
            console.error("Error removing document", err);
        });
    }

    //This function changes the boolean value of sortedAlphabetically
    _onSortByAlphaClick = () => {
        //Takes in the state
        let alpha = this.state.sortedAlphabetically;
        //Inverts the alpha
        alpha = !alpha;
        this.setState({sortedAlphabetically: alpha} )
      };

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

        let setlists = [];

        if (this.state.sortedAlphabetically && hasSetlists) {
            setlists = band.setlists.slice();
            //Sorting the setlists alphabetically
            setlists = setlists.sort((a, b) => a.title.localeCompare(b.title)).slice();
            //console.log("Scores: ", setlists)
        }
        else if (hasSetlists){
            setlists = band.setlists.slice();
            //console.log("Scores: ", setlists)
        }

        return <div>
            <div style={{display: 'flex', alignItems: 'center', padding: '0 24px', height: 56}}>
                <div className={classes.flex}/>

                <IconButton>
                    <SortByAlpha onClick={this._onSortByAlphaClick}/>
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
                                 setlists.map((setlist, index) =>
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
                        {setlists.map((setlist, index) =>
                            <Card key={index} className={classes.card} 
                                  elevation={1}>
                                <CardMedia
                                    className={classes.media}
                                    onClick={() => window.location.hash = `#/setlist/${band.id}${setlist.id}`}
                                    image="https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"
                                    title=""
                                    
                                />
                                <CardContent style={{position: 'relative'}}>
                                    <Typography variant="headline" component="h2">
                                        {setlist.title}
                                        <IconButton style={{position: 'absolute', right: '15px'}}>
                                            <DeleteIcon onClick={() => this._onSetlistDeleteClick(setlist.id, setlist.title)}/>
                                        </IconButton>
                                    </Typography>
                                    <Typography component="p">
                                        {/*Checking for date setlist.date, if that does not exist, then we don't display anything*/}
                                        {setlist.date && this._formatedDate(setlist.date)}
                                    </Typography>
                                    
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
            <AsyncDialog title={this.state.title} onRef={ref => this.dialog = ref}>
                <Typography variant="body1" >{this.state.message}</Typography>
            </AsyncDialog>
        </div>
        
    }
}


export default withStyles(styles)(Setlists);