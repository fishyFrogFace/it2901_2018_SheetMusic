import React from 'react';
import {withStyles} from 'material-ui/styles';
import {Paper} from "material-ui";

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
        value: ''
    };

    _onInputChange = e => {
        this.setState({value: e.target.value});
    };

    render() {
        const {value} = this.state;
        const {classes} = this.props;

        return (
            <div style={{width: '100%', maxWidth: '700px', position: 'relative'}}>
                <input
                    className={classes.input}
                    placeholder="Search for scores and setlists"
                    onChange={this._onInputChange}
                />
                {
                    value &&
                    <Paper style={{position: 'absolute', top: 56, background: 'white', width: '100%', height: 315}}>
                    </Paper>
                }

            </div>
        );
    }
}

export default withStyles(styles)(SearchBar);
