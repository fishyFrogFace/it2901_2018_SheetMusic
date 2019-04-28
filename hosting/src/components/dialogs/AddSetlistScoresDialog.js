/**
 * This dialog is used in setlist.js (Sub page setlist)
 * Makes it possible to add scores to a setlist
 */

import React from 'react';
import { withStyles } from 'material-ui/styles';

import AsyncDialog from "./AsyncDialog";
import { List, ListItem, Checkbox, ListItemText } from 'material-ui';

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
        }
        else {
            selectedScores.add(index);

        }

        this.setState({ selectedScores: selectedScores });
    }

    async open() {
        await this.dialog.open();

        return Array.from(this.state.selectedScores).map(i => this.props.band.scores[i].id);
    }

    render() {
        const { selectedScores } = this.state;
        const { classes, band } = this.props;
        return <AsyncDialog fullscreen title='Add scores to setlist' confirmText='Add Scores' onRef={ref => this.dialog = ref}>
            <List dense>
                {/*Loops over the scores and align a checkbox to each one */}
                {band && band.scores && band.scores.map((score, index) =>
                    <ListItem style={{ padding: 0 }} key={index} onClick={e => this._onSelectableClick(index)}>
                        <Checkbox id="scores-checkbox-button" classes={{ checked: classes.checkbox__checked }} checked={selectedScores.has(index)} />
                        <ListItemText primary={`${score.title} - ${score.composer}`} />
                    </ListItem>
                )}
            </List>
        </AsyncDialog>
    }
}


export default withStyles(styles)(AddSetlistScoresDialog);
