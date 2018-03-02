import React from 'react';

import {withStyles} from "material-ui/styles";
import CheckCircleIcon from 'material-ui-icons/CheckCircle';

const styles = {
    root: {
        backgroundColor: '#dedede',
        position: 'relative',
        cursor: 'pointer'
    },

    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundSize: '150% auto',
        backgroundPosition: 'left top',
        backgroundRepeat: 'no-repeat'
    },

    icon: {
        position: 'absolute',
        top: 15,
        left: 15
    }
};

class Selectable extends React.Component {
    state = {
        hover: false
    };

    componentWillReceiveProps(props) {
        if (props.selected !== this.props.selected) {
            this.image.animate([
                {transform: props.selected ? 'scale(1)' : 'scale(0.8)'},
                {transform: props.selected ? 'scale(0.8)' : 'scale(1)'}
            ], {
                duration: 200,
                fill: 'forwards',
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
            });
        }
    }

    _onMouseEnter() {
        this.setState({hover: true});
    }

    _onMouseLeave() {
        this.setState({hover: false});
    }

    render() {
        const {classes, imageURL = '', selected} = this.props;
        const {hover} = this.state;

        return <div
            className={classes.root}
            onClick={() => this.props.onClick()}
            onMouseEnter={() => this._onMouseEnter()}
            onMouseLeave={() => this._onMouseLeave()}
        >
            <div ref={ref => this.image = ref} className={classes.image} style={{backgroundImage: `url(${imageURL})`}}/>
            {(hover || selected) && <CheckCircleIcon style={{color: selected ? '#4285f4' : '#d2d2d2'}} className={classes.icon}/>}
        </div>;
    }
}


export default withStyles(styles)(Selectable);