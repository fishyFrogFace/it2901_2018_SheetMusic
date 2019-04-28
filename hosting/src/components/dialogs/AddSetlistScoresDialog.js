/**
 * This dialog is used in setlist.js
 */

import React from 'react';
import {withStyles} from 'material-ui/styles';

import AsyncDialog from "./AsyncDialog";
import {List, ListItem, Checkbox, ListItemText, Typography} from 'material-ui';

const styles = theme => ({
    checkbox__checked: {
        color: theme.palette.secondary.main
    }
});

class AddSetlistScoresDialog extends React.Component {
    state = {
        selectedScores: new Set()
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    _onSelectableClick(index) {
        let selectedScores = new Set(this.state.selectedScores);

        if (selectedScores.has(index)) {
            selectedScores.delete(index);
            
        console.log("Depeted");
        } else {
            selectedScores.add(index);

        }

        this.setState({selectedScores: selectedScores});
    }

    async open() {
        await this.dialog.open();

        return Array.from(this.state.selectedScores).map(i => this.props.band.scores[i].id);
    }

    render() {
        const {selectedScores} = this.state;
        const {classes, band} = this.props;
        //console.log('band.scores: ', band.scores);
        //console.log(band.scores === undefined || band.scores === []);
        //console.log(Array.isArray(band.scores) || band.scores === undefined);
        //let emptyScoresList = Array.isArray(band.scores).length === 0 || band.scores === undefined;
        //console.log('Array.isArray(band.scores).length: ',Array.isArray(band.scores).length);
        return <AsyncDialog fullscreen title='Add scores to setlist' confirmText='Add Scores' onRef={ref => this.dialog = ref}>
            <List dense>
            {band && band.scores && band.scores.map((score, index) =>
                <ListItem style={{padding: 0}} key={index} onClick={e => this._onSelectableClick(index)}>
                    <Checkbox id="scores-checkbox-button" classes={{checked: classes.checkbox__checked}} checked={selectedScores.has(index)}/>
                    <ListItemText primary={`${score.title} - ${score.composer}`}/>
                </ListItem>
            )}
            {/*!emptyScoresList && <Typography>You have not added any scores yet, go to the scores tab to add some!</Typography>*/}
            </List>
            
        </AsyncDialog>
    }
}


export default withStyles(styles)(AddSetlistScoresDialog);