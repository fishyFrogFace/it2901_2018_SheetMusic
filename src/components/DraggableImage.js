import React from 'react';

import {withStyles} from "material-ui/styles";
import CheckCircleIcon from 'material-ui-icons/CheckCircle';
import {Paper} from "material-ui";

const styles = {
    root: {
        background: 'white',
        cursor: 'pointer',
        position: 'relative'
    },

    paper: {
        width: '100%',
        height: '100%',
        overflow: 'hidden'
    },

    imageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },

    image: {
        width: '100%'
    },

    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    }
};

class DraggableImage extends React.Component {
    state = {
        hover: false
    };

    componentWillReceiveProps(props) {
        if (props.selected !== this.props.selected) {
            this.imageContainer.animate([
                {boxShadow: props.selected ? 'none' : 'inset 0px 0px 300px 200px rgba(66,133,244,0.4)'},
                {boxShadow: props.selected ? 'inset 0px 0px 300px 200px rgba(66,133,244,0.4)' : 'none'}
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
            draggable
            onDragStart={e => this.props.onDragStart(e)}
            onClick={e => this.props.onClick(e)}
        >
            <Paper
                className={classes.paper}
                onMouseEnter={() => this._onMouseEnter()}
                onMouseLeave={() => this._onMouseLeave()}
                elevation={hover ? 2 : 1}
            >
                <div className={classes.imageContainer} >
                    <img className={classes.image} src={imageURL}/>
                    <div className={classes.imageOverlay} ref={ref => this.imageContainer = ref}/>
                </div>
            </Paper>
        </div>
    }
}


export default withStyles(styles)(DraggableImage);