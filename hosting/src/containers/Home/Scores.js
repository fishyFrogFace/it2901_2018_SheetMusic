import React from 'react';

import {withStyles} from "material-ui/styles";
import {Card, CardContent, CardMedia, Typography} from "material-ui";

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

class Scores extends React.Component {
    state = {};

    render() {
        const {classes, band} = this.props;

        return <div style={{display: 'flex', flexWrap: 'wrap', paddingTop: 20, paddingLeft: 20}}>
            {band.scores && band.scores.map((arr, index) =>
                <Card key={index} className={classes.card}
                      onClick={() => window.location.hash = `#/score/${band.id}${arr.id}`}
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
    }
}


export default withStyles(styles)(Scores);