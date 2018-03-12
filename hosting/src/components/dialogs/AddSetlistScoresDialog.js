import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';

import Typography from 'material-ui/Typography';
import AsyncDialog from "./AsyncDialog";
import {List, ListItem, Checkbox} from 'material-ui';

const styles = {
    no_margin:{
        margin:0,
        padding:0
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
        
        return <AsyncDialog fullscreen title={`Add scores to setlist`} confirmText='Add Scores' onRef={ref => this.dialog = ref}>
            <List className={classes.no_margin}>
            {scores.map((arr, index) =>
                <ListItem onClick={e => this._onSelectableClick(index)} className={classes.no_margin}>
                   
                   <Typography variant='subheading'>
                    <Checkbox 
                        color='inherit'
                        checked = {arr.selected}
                    />
                        {arr.title} by {arr.composer}
                    </Typography>
                </ListItem>
            )}
            </List>
        </AsyncDialog>
    }
}


export default withStyles(styles)(AddSetlistScoresDialog);