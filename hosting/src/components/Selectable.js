import React from 'react';

import {withStyles} from "material-ui/styles";
import {CircularProgress, Typography} from "material-ui";
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
        iconHover: false,
        canFireClick: false
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

    _onMouseDown = e => {
        if (this.props.selectMode) {
            this.props.onSelect(e);
            this.setState({canFireClick: false})
        } else {
            this.setState({canFireClick: true})
        }
    };

    _onMouseClick = e => {
        if (this.state.canFireClick) {
            this.props.onClick();
        }
    };

    render() {
        const {classes, imageURL, selected, title, selectMode, zoomed} = this.props;
        const {hover, iconHover} = this.state;

        const imageProps = zoomed ? {style: {width: '330%', marginLeft: '-70%'}} : {style: {width: '100%'}};

        return <div
            className={classes.root}
            onMouseDown={this._onMouseDown}
            onClick={this._onMouseClick}
            onMouseEnter={this._onMouseEnter}
            onMouseLeave={this._onMouseLeave}
        >
            <div ref={ref => this.imageContainer = ref} className={classes.imageContainer}>
                {
                    !imageURL &&
                    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white'}}>
                        <CircularProgress style={{marginTop: -20}} color="secondary" size={60}/>
                    </div>
                }
                {
                    imageURL &&
                    <img src={imageURL} {...imageProps}/>
                }

                {title && <Typography variant='subheading' className={classes.title}>{title}</Typography>}
            </div>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    boxShadow: (!selected && hover) || (!selected && selectMode) ? 'inset 0px 135px 78px -105px rgba(189,189,189,1)' : 'none'
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