import React from 'react';

import {withStyles} from "material-ui/styles";
import {Button, Card, CardContent, CardMedia, Typography} from "material-ui";
import {PlaylistAdd} from "material-ui-icons";

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
    }
};
class Setlists extends React.Component {
    state = {};

    _onSetlistCreateClick = () => {
        this.props.onCreateSetlist();
    };

    render() {
        const {classes, band} = this.props;
        return <div style={{display: 'flex', flexWrap: 'wrap', paddingTop: 20, paddingLeft: 20}}>
            {band.setlists && band.setlists.map((setlist, index) =>
                <Card key={index} className={classes.card}
                      onClick={() => window.location.hash = `#/setlist/${setlist.id}`}
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