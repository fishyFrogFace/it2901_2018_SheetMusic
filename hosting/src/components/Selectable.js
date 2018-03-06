import React from 'react';

import {withStyles} from "material-ui/styles";
import {Typography} from "material-ui";
import {RadioButtonUnchecked, CheckCircle} from "material-ui-icons";

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
        hover: false,
        iconHover: false
    };

    componentDidUpdate(prevProps, prevState) {
        const curProps = this.props;
        const curState = this.state;

        if (prevProps.selected !== curProps.selected) {
            this.imageContainer.animate([
                {transform: curProps.selected ? 'scale(1)' : 'scale(0.88)'},
                {transform: curProps.selected ? 'scale(0.88)' : 'scale(1)'}
            ], {
                duration: 150,
                fill: 'forwards',
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
            });
        }

        if (!curProps.selectMode && !prevProps.selected && prevState.hover !== this.state.hover) {
            this.shadow.animate([
                {boxShadow: curState.hover ? 'none' : 'inset 40px 200px 285px -200px rgba(0,0,0,0.75)'},
                {boxShadow: curState.hover ? 'inset 40px 200px 285px -200px rgba(0,0,0,0.75)' : 'none'}
            ], {
                duration: 50,
                fill: 'forwards'
            });
        }

        if (prevProps.selectMode !== curProps.selectMode) {
            this.shadow.animate([
                {boxShadow: curProps.selectMode ? 'none' : 'inset 40px 200px 285px -200px rgba(0,0,0,0.75)'},
                {boxShadow: curProps.selectMode ? 'inset 40px 200px 285px -200px rgba(0,0,0,0.75)' : 'none'}
            ], {
                duration: 50,
                fill: 'forwards'
            });
        }
    }

    _onMouseEnter = () => {
        this.setState({hover: true});
    };

    _onMouseLeave = () => {
        this.setState({hover: false});
    };

    _onIconMouseEnter = () => {
        this.setState({iconHover: true});
    };

    _onIconMouseLeave = () => {
        this.setState({iconHover: false});
    };

    render() {
        const {classes, imageURL, selected, title, selectMode} = this.props;
        const {hover, iconHover} = this.state;

        return <div
            className={classes.root}
            onClick={!selectMode ? this.props.onClick : () => {}}
            onMouseDown={selectMode ? this.props.onSelect : () => {}}
            onMouseEnter={this._onMouseEnter}
            onMouseLeave={this._onMouseLeave}
        >
            <div ref={ref => this.imageContainer = ref} className={classes.imageContainer}>
                <img src={imageURL} className={classes.image}/>
                {title && <Typography variant='subheading' className={classes.title}>{title}</Typography>}
            </div>
            <div
                ref={ref => this.shadow = ref}
                style={{
                    zIndex: selected ? -1 : 0,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                }}
            />
            {
                (hover || selected) &&
                <CheckCircle
                    className={classes.icon}
                    style={{color: selected ? '#4285f4' : iconHover || (hover && selectMode) ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}}
                    onMouseEnter={this._onIconMouseEnter}
                    onMouseLeave={this._onIconMouseLeave}
                    onMouseDown={this.props.onSelect}
                    onClick={e => e.stopPropagation()}
                />
            }
            {
                selectMode && !hover && !selected &&
                <RadioButtonUnchecked
                    className={classes.icon}
                    style={{color: 'rgba(255, 255, 255, 0.7)'}}
                />
            }
        </div>;
    }
}


export default withStyles(styles)(Selectable);