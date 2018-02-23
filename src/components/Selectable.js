import React from 'react';

import {withStyles} from "material-ui/styles";

const styles = {
    root: {
        backgroundColor: '#dedede',
        position: 'relative'
    },

    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundSize: 'cover'
    }
};

class Selectable extends React.Component {
    componentWillReceiveProps(props) {
        if (props.selected !== this.props.selected) {
            this.root.animate([
                {transform: props.selected ? 'scale(1)' : 'scale(0.8)'},
                {transform: props.selected ? 'scale(0.8)' : 'scale(1)'}
            ], {
                duration: 200,
                fill: 'forwards',
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
            });
        }
    }

    render() {
        const {classes, imageURL=''} = this.props;

        return <div className={classes.root} onClick={() => this.props.onClick()}>
            <div ref={ref => this.root = ref} className={classes.image} style={{backgroundImage: `url(${imageURL})`}}></div>
        </div>;
    }
}


export default withStyles(styles)(Selectable);