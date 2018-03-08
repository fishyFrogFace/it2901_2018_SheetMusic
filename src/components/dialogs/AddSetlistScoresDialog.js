import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import AsyncDialog from "./AsyncDialog";
import Selectable from "../Selectable";

const styles = {

    selectable: {
        height: 150,
        flex: 2,
        marginBottom: 20
    }
}

class AddSetlistScoresDialog extends Component {
    state = {
        scores: [],
        selectedScores: []
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    _onSelectableClick(index) {
        let scores = [...this.state.scores];
        scores[index].selected = !scores[index].selected;
        this.setState({scores: scores});
    }

    async open(scores) {
        this.setState({scores: scores.map(score => {
            return {...score, selected: false};
        })});
        await this.dialog.open();

        return this.state.scores.filter(arr => arr.selected).map((arr) => arr.id);
    }

    render() {
        const {scores} = this.state;
        const {classes} = this.props
        
        return <AsyncDialog title={`Add scores to setlist`} confirmText='Add Scores' onRef={ref => this.dialog = ref}>
            {scores.map((arr, index) =>
                <Selectable
                    classes={{root: classes.selectable}}
                    key={index}
                    imageURL={"https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"}
                    selected={arr.selected}
                    onClick={(i => () => this._onSelectableClick(i))(index)}
                />
            )}
        </AsyncDialog>
    }
}


export default withStyles(styles)(AddSetlistScoresDialog);