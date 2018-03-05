import React from 'react';

import {withStyles} from "material-ui/styles";
import CheckCircleIcon from 'material-ui-icons/CheckCircle';
import {Typography} from "material-ui";

const styles = {
    root: {
        backgroundColor: '#eeeeee',
        position: 'relative',
        cursor: 'pointer'
    },

    imageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
    },

    image: {
        width: '150%'
    },

    title: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: 10,
        boxSizing: 'border-box',
        background: 'rgba(0, 0, 0, 0.6)',
        color: 'white'
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
            this.imageContainer.animate([
                {transform: props.selected ? 'scale(1)' : 'scale(0.88)'},
                {transform: props.selected ? 'scale(0.88)' : 'scale(1)'}
            ], {
                duration: 150,
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
        const {classes, imageURL, selected, title} = this.props;
        const {hover} = this.state;

        return <div
            className={classes.root}
            onMouseDown={() => this.props.onMouseDown()}
            onMouseEnter={() => this._onMouseEnter()}
            onMouseLeave={() => this._onMouseLeave()}
        >
            <div ref={ref => this.imageContainer = ref}  className={classes.imageContainer}>
                <img src={imageURL} className={classes.image}/>
                {title && <Typography variant='subheading' className={classes.title}>{title}</Typography>}
            </div>
            {(hover || selected) && <CheckCircleIcon style={{color: selected ? '#4285f4' : '#d2d2d2'}} className={classes.icon}/>}
        </div>;
    }
}


export default withStyles(styles)(Selectable);