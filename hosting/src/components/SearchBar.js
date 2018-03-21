import React from 'react';
import {withStyles} from 'material-ui/styles';
import {List, ListItem, ListItemText, Paper} from "material-ui";
import Fuse from 'fuse.js';
import {LibraryMusic, QueueMusic} from "material-ui-icons";

const styles = theme => ({
    input: {
        width: '100%',
        outline: 'none',
        border: 'none',
        padding: '11px 16px',
        background: 'rgba(0,0,0,0.07)',
        height: '46px',
        boxSizing: 'border-box',
        borderRadius: '4px',
        font: 'normal 16px Roboto'
    }
});

class SearchBar extends React.Component {
    state = {
        value: '',
        resultsVisble: false
    };

    constructor(props) {
        super(props);

        window.onclick = () => {
            this.setState({resultsVisible: false});
        };
    }

    _onInputChange = e => {
        this.setState({value: e.target.value});
    };

    componentWillUpdate(nextProps, nextState) {
        const {band} = this.props;

        if (this.state.value !== nextState.value) {
            if (!this.fuse) {
                this.fuse = new Fuse([
                    ...band.scores.map(s => ({id: s.id, title: s.title, type: 'score'})),
                    ...band.setlists.map(s => ({id: s.id, title: s.title, type: 'setlist'}))
                ], {keys: ['title']})
            }

            this.setState({results: this.fuse.search(nextState.value)});
        }
    }

    _onInputFocus = () => {
        this.setState({resultsVisible: true});
    };

    _onResultClick = result => {
        window.location.hash = `/${result.type}/${this.props.band.id}${result.id}`;
    };

    render() {
        const {value, results, resultsVisible} = this.state;
        const {classes} = this.props;

        return (
            <div style={{width: '100%', maxWidth: '700px', position: 'relative'}} onClick={e => e.stopPropagation()}>
                <input
                    className={classes.input}
                    placeholder="Search for scores and setlists"
                    onChange={this._onInputChange}
                    onFocus={this._onInputFocus}
                />
                {
                    resultsVisible && results && results.length > 0 &&
                    <Paper style={{position: 'absolute', top: 56, background: 'white', width: '100%'}}>
                        <List>
                            {
                                results.slice(0, 5).map((result, index) =>
                                <ListItem button key={index} onClick={e => this._onResultClick(result)}>
                                    {result.type === 'score' && <LibraryMusic/>}
                                    {result.type === 'setlist' && <QueueMusic/>}
                                    <ListItemText primary={result.title}/>
                                </ListItem>)
                            }
                        </List>
                    </Paper>
                }

            </div>
        );
    }
}

export default withStyles(styles)(SearchBar);
