import React from 'react';

import {withStyles} from "material-ui/styles";
import {
    Button, Card, CardContent, CardMedia, Checkbox, IconButton, List, ListItem, ListItemText, Paper,
    Typography
} from "material-ui";
import {PlaylistAdd, QueueMusic, SortByAlpha, ViewList, ViewModule} from "material-ui-icons";

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

    _onViewModuleClick = () => {
        window.localStorage.removeItem('setlistsListView');
        this.setState({listView: false});
    };

    _onViewListClick = () => {
        window.localStorage.setItem('setlistsListView', 'true');
        this.setState({listView: true});
    };

    _onSetlistCreateClick = () => {
        this.props.onCreateSetlist();
    };

    render() {
        const {classes, band} = this.props;
        const {listView} = this.state;

        const hasSetlists = band.setlists && band.setlists.length > 0;

        return <div>
            <div style={{display: 'flex', alignItems: 'center', padding: '0 24px', height: 56}}>
                <div className={classes.flex}/>

                <IconButton>
                    <SortByAlpha/>
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
                                        <QueueMusic color='secondary'/>
                                        <ListItemText primary={setlist.title}/>
                                    </ListItem>)
                            }
                        </List>
                    </Paper>
                }
                {
                    !listView && hasSetlists &&
                    <div style={{display: 'flex', flexWrap: 'wrap'}}>
                        {band.setlists.map((setlist, index) =>
                            <Card key={index} className={classes.card}
                                  onClick={() => window.location.hash = `#/setlist/${band.id}${setlist.id}`}
                                  elevation={1}>
                                <CardMedia
                                    className={classes.media}
                                    image="https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"
                                    title=""
                                />
                                <CardContent>
                                    <Typography variant="headline" component="h2">
                                        {setlist.title}
                                    </Typography>
                                    <Typography component="p">
                                        {setlist.date.toLocaleDateString()}
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
                style={{position: 'fixed', bottom: 32, right: 32}}
            >
                <PlaylistAdd/>
            </Button>
        </div>
    }
}


export default withStyles(styles)(Setlists);