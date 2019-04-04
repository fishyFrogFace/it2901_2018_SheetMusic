import React from 'react';
import { List, ListItem, ListItemText } from "material-ui";
import { withStyles } from "material-ui/styles";
import firebase from 'firebase';

const styles = {
    instrumentstyle: {
        borderStyle: 'groove',
        borderWidth: '1px',
        padding: '8px',
        margin: '5px',
        cursor: 'pointer',
        minWidth: '80px',
        textAlign: 'center',
        '&:first-child': {
            paddingLeft: '8px',
        }
    },
}

class InstrumentScores extends React.Component {
    constructor(props) {
        super(props)

    }


    render() {
        const { classes } = this.props;
        return <div>
            {
                // map over parts/tone
                <ListItem>
                    {this.props.test.liste.map((instr, index) =>
                        <ListItemText primary={instr} className={classes.instrumentstyle} key={index}>  </ListItemText>)}
                    {/* <img src={this.props.band.scores[3].parts[0].pages[0].croppedURL}></img> */}
                </ListItem>
            }<div>
            </div>
        </div>
    }
}

export default withStyles(styles)(InstrumentScores);