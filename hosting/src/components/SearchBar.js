import React from 'react';
import {withStyles} from 'material-ui/styles';
import {List, ListItem, ListItemText, Paper} from "material-ui";
import Fuse from 'fuse.js';
import {LibraryMusic, QueueMusic} from "material-ui-icons";
import firebase from 'firebase';

const styles = theme => ({
    root: {
        width: '100%',
        maxWidth: '700px',
        position: 'relative'
    },

    input: {
        width: '100%',
        outline: 'none',
        border: 'none',
        padding: '11px 16px',
        background: 'rgba(0,0,0,0.07)',
        height: '36px',
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

    async componentDidUpdate(prevProps, prevState) {
        const {bandId} = this.props;
        const {value} = this.state;

        if (value !== prevState.value) {
            if (!this.fuse) {
                const bandRef = firebase.firestore().doc(`bands/${bandId}`);
                const scores = (await bandRef.collection('scores').get()).docs.map(doc => ({...doc.data(), id: doc.id}));
                const setlists = (await bandRef.collection('setlists').get()).docs.map(doc => ({...doc.data(), id: doc.id}));

                console.log(scores);

                this.fuse = new Fuse([
                    ...scores.map(s => ({id: s.id, title: s.title, type: 'score'})),
                    ...setlists.map(s => ({id: s.id, title: s.title, type: 'setlist'}))
                ], {keys: ['title']})
            }

            this.setState({results: this.fuse.search(value)});
        }
    }

    _onInputFocus = () => {
        this.setState({resultsVisible: true});
    };

    _onResultClick = result => {
        window.location.hash = `/${result.type}/${this.props.bandId}${result.id}`;
    };

    render() {
        const {value, results, resultsVisible} = this.state;
        const {classes} = this.props;

        return (
            <div className={classes.root} onClick={e => e.stopPropagation()}>
                <input
                    className={classes.input}
                    placeholder="Search for scores and setlists"
                    onChange={this._onInputChange}
                    onFocus={this._onInputFocus}
                />
                {
                    resultsVisible && results && results.length > 0 &&
                    <Paper style={{position: 'absolute', top: 48, background: 'white', width: '100%'}}>
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
