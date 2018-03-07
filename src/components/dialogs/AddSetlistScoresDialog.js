import React from 'react';

import AsyncDialog from "./AsyncDialog";
import Selectable from "../Selectable";

class AddSetlistScoresDialog extends React.Component {
    state = {
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
        return this.state.selectedScores;
    }

    render() {
        const {scores} = this.state;
        
        return <AsyncDialog title={`Add scores to setlist`} confirmText='Add Scores' onRef={ref => this.dialog = ref}>
            {scores && scores.map((score, index) => {
                <Selectable
                    key={index}
                    imageURL={"https://previews.123rf.com/images/scanrail/scanrail1303/scanrail130300051/18765489-musical-concept-background-macro-view-of-white-score-sheet-music-with-notes-with-selective-focus-eff.jpg"}
                    selected={score.selected}
                    onClick={(i => () => this._onSelectableClick(i))(index)}
                />
            })
            }
        </AsyncDialog>
    }
}


export default AddSetlistScoresDialog;