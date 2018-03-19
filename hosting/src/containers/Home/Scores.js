import React from 'react';

import {withStyles} from "material-ui/styles";
import {
    Avatar, Card, CardContent, CardMedia, IconButton, List, ListItem, ListItemText, Paper,
    Typography
} from "material-ui";
import {LibraryMusic, SortByAlpha, ViewList, ViewModule} from "material-ui-icons";

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

class Scores extends React.Component {
    state = {
        listView: false
    };

    componentWillMount() {
        if (window.localStorage.getItem('scoresListView')) {
            this.setState({listView: true});
        }
    }

    _onViewModuleClick = () => {
        window.localStorage.removeItem('scoresListView');
        this.setState({listView: false});
    };

    _onViewListClick = () => {
        window.localStorage.setItem('scoresListView', 'true');
        this.setState({listView: true});
    };

    render() {
        const {classes, band} = this.props;
        const {listView} = this.state;

        const hasScores = band.scores && band.scores.length > 0;

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
                    listView && hasScores &&
                    <Paper>
                        <List>
                            {
                                band.scores.map((score, index) =>
                                    <ListItem key={index} dense button onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                                        <LibraryMusic color='secondary'/>
                                        <ListItemText primary={score.title}/>
                                    </ListItem>)
                            }
                        </List>
                    </Paper>
                }
                {
                    !listView && hasScores &&
                    <div style={{display: 'flex', flexWrap: 'wrap'}}>
                        {band.scores.map((score, index) =>
                            <Card key={index} className={classes.card}
                                  onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                                  elevation={1}>
                                <CardMedia
                                    className={classes.media}
                                    image="https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"
                                    title=""
                                />
                                <CardContent>
                                    <Typography variant="headline" component="h2">
                                        {score.title}
                                    </Typography>
                                    <Typography component="p">
                                        {score.composer}
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                }
            </div>
        </div>
    }
}


export default withStyles(styles)(Scores);