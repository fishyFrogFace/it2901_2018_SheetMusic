import React, {Component} from 'react';
import {withStyles} from 'material-ui/styles';
import firebase from "firebase";
import {Paper, Typography} from "material-ui";
import download from '../images/Sheetmusic_illustrations_logging.svg';
import setlist from '../images/setlist.svg';
import arrangement from '../images/arrangement.svg';
import sheet from '../images/sheet.svg';

const styles = {
    root: {
        display: 'block'
    },

    videoContainer: {
        position: 'relative',
        background: 'black',
        height: '60vh',
        overflow: 'hidden'
    },

    iframe: {
        position: 'absolute',
        top: '-50%',
        left: 0,
        width: '100%',
        height: '200%'
    },

    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)'
    },

    title: {
        color: 'white'
    },

    overlayContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 200,
        justifyContent: 'space-between',
    },

    button: {
        background: 'white',
        height: 40,
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 2,
        width: 200,
        cursor: 'pointer'
    },

    buttonIcon: {
        width: '18px',
        height: '18px'
    },

    buttonText: {
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 0.54)',
        marginLeft: '20px'
    },

    headline: {
        textAlign: 'center',
        margin: '60px 0'
    },

    infoContainer: {
        display: 'flex',
        margin: 50
    },

    info: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 250,
        margin: '0 auto',
        height: 250
    },

    infoHeader: {
        marginTop: 10,
        marginBottom: 10
    },

    infoText: {
        textAlign: 'center'
    },

    infoImage: {
        width: 120,
    }
};

/**
 * Landing page for users that are not logged in. Contains link to Google login and descriptions of the services
 * provided.
 */

class SignIn extends Component {
    _onSignIn = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();

        try {
            await firebase.auth().signInWithPopup(provider);
        } catch (err) {
            console.log(err);
        }
    };

    render() {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <div className={classes.videoContainer}>
                    <iframe
                        className={classes.iframe}
                        src="https://www.youtube.com/embed/ImBqC-rGpX8?start=13&end=74&controls=0&showinfo=0&rel=0&autoplay=1&mute=1&loop=1&playlist=ImBqC-rGpX8"/>
                    <div className={classes.overlay}>
                        <div className={classes.overlayContainer}>
                            <Typography variant='display4' className={classes.title}>ScoresButler</Typography>
                            <Paper elevation={1}>
                                <div className={classes.button} onClick={() => this._onSignIn()}>
                                    <img className={classes.buttonIcon} alt={"Google"}
                                         src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"/>
                                    <Typography variant='body2' className={classes.buttonText}>Sign in with
                                        Google</Typography>
                                </div>
                            </Paper>
                        </div>
                    </div>
                </div>
                <div>
                    <Typography variant='display1' className={classes.headline}>
                        ScoresButler makes managing your sheets easy.
                    </Typography>
                    <div className={classes.infoContainer}>
                        <div className={classes.info}>
                            <img className={classes.infoImage} src={sheet} alt={"sheet"}/>
                            <Typography variant='subheading' className={classes.infoHeader}>Upload</Typography>
                            <Typography variant='body1' className={classes.infoText}>
                                Upload your scores, arrange and sort them into instrument
                                specific documents.
                            </Typography>
                        </div>
                        <div className={classes.info}>
                            <img className={classes.infoImage}  src={arrangement} alt={"setlist"}/>
                            <Typography variant='subheading' className={classes.infoHeader}>Archive</Typography>
                            <Typography variant='body1' className={classes.infoText}>
                                Archive all your bands scores, and access them everywhere.
                            </Typography>
                        </div>
                        <div className={classes.info}>
                            <img className={classes.infoImage} src={setlist} alt={"setlist"}/>
                            <Typography variant='subheading' className={classes.infoHeader}>Create</Typography>
                            <Typography variant='body1' className={classes.infoText}>
                                Create setlists for your band which contain arrangements
                                and other events during a set, in a chronological order.
                            </Typography>
                        </div>
                        <div className={classes.info}>
                            <img className={classes.infoImage} src={download} alt={"download"}/>
                            <Typography variant='subheading' className={classes.infoHeader}>Download</Typography>
                            <Typography className={classes.infoText} variant='body1'>
                                Download your part of the set.
                            </Typography>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(SignIn);
