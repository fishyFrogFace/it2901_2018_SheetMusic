import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';
import firebase from "firebase";

import archiveImg from '../img/archive.png';
import loggingImg from '../img/logging.png';
import personalImg from '../img/personal.png';
import setlistImg from '../img/setlist.png';
import sheetImg from '../img/sheet1.png';

import MenuIcon from 'material-ui-icons/Menu';

import {
    Button, Grid, AppBar, Toolbar, IconButton
} from "material-ui";

export const signIn = prov => async dispatch => {
  let provider;

  if(prov === 'google'){
    provider = new firebase.auth.GoogleAuthProvider();
  } else if(prov === 'facebook') {
    provider = new firebase.auth.FacebookAuthProvider();
  }

    try {
        let result = await firebase.auth().signInWithPopup(provider);

        dispatch({type: 'SIGN_IN_SUCCESS', user: result.user});

        let userSnapshot = await firebase.firestore().doc(`users/${result.user.uid}`).get();

        if (!userSnapshot.exists) {
            await userSnapshot.ref.set({name: result.user.displayName});
            dispatch({type: 'USER_CREATE_SUCCESS'});
        }
    } catch (err) {
        dispatch({type: 'SIGN_IN_FAILURE', error: err});
    }
};

const styles = {
    root: {
      fontFamily: 'Roboto',
      fontWeight: '300'
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20,
      color: 'rgb(255,255,255)'
    },
    header: {
      background: 'rgb(0,188,212)',
      height: '40em',
      textAlign: 'center',
    },
    captionBox: {
      paddingTop: '18em',
      color: 'rgb(255,255,255)'
    },
    caption: {
      fontWeight: '300',
      fontSize: '56px',
    },
    slogan: {
      fontWeight: '300',
      fontSize: '24px',
      lineHeight: '28px',
      marginBottom: '12px',
      letterSpacing: '0px',
    },
    button: {
      margin: '5px',
      background: 'rgb(255,255,255)',
      color: 'rgb(0,188,212)',
        ':hover': {
          background: 'rgb(238,238,238)',
        },
    },
    midPart: {
      background: 'rgb(238, 238, 238)',
      height: '15em',
      textAlign: 'center',
    },
    description: {
      padding: '15px 200px 15px 200px',
      fontWeight: '300',
      fontSize: '24px',
      lineHeight: '28px',
    },
    bottomPart: {
      background: 'rgb(255,255,255)',
      height: '23em',
      textAlign: 'center',
    },
    image: {
      paddingTop: '40px'
    },
    imageSpecial: {
      paddingTop: '40px',
      paddingBottom: '20px'
    },
    imageText: {
      padding: '15px'
    },
    footer: {
      background: 'rgb(0,188,212)',
      color: 'rgb(255,255,255)',
      textAlign: 'center',
      fontWeight: '300',
      fontSize: '12px'
    }
  };

class SignIn extends Component {
    componentWillMount() {
    }

    _onSignIn(provider) {
        this.props.dispatch(signIn(provider));
    }

    render() {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
              <AppBar position='static'>
                <Toolbar>
                  <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
                    <MenuIcon />
                  </IconButton>
                </Toolbar>
              </AppBar>
              <Grid container spacing={8} alignItems={'center'} className={classes.header}>
                <Grid item xs={12} alignItems={'center'} className={classes.header}>
                  <div className={classes.captionBox}>
                    <h1 className={classes.caption}>Score Butler</h1>
                    <p className={classes.slogan}>The best way to store adfadfadsfsa</p>
                    <Button
                      variant='raised'
                      className={classes.button}
                      onClick={() => this._onSignIn('google')}>
                      Sign in with Google
                    </Button>
                    <Button
                      variant='raised'
                      className={classes.button}
                      onClick={() => this._onSignIn('facebook')}>
                      Sign in with Facebook
                    </Button>
                  </div>
                </Grid>
              </Grid>
              <Grid container spacing={8} className={classes.midPart}>
                <Grid item xs={12} className={classes.midPart}>
                  <p className={classes.description}>
                    ScoreButler is a tool which allows ensembles to upload
                    and archive all their scores.

                    It helps the band easily create arrangements and setlists
                    containing detailed information about the entire event.
                  </p>
                  <p className={classes.description}>
                    Get started today, with the #1 online score manager.
                  </p>
                </Grid>
              </Grid>
              <Grid container spacing={12} className={classes.bottomPart}>
                <Grid item xs={1} className={classes.bottomPart}></Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={archiveImg} className={classes.image} />
                  <p className={classes.imageText}>
                    Get a list of detailed information about all your bands
                    arrangements.
                  </p>
                </Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={loggingImg} className={classes.image} />
                  <p className={classes.imageText}>
                    Track who downloads the sets.
                  </p>
                </Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={personalImg} className={classes.image} />
                  <p className={classes.imageText}>
                    Download setlists containing only your *stemme* for all
                    instruments.
                  </p>
                </Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={setlistImg} className={classes.imageSpecial} />
                  <p className={classes.imageText}>
                    Create setlists for your band which contain arrangements and
                    other events during a set, in a chronological order.
                  </p>
                </Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={sheetImg} className={classes.image} />
                  <p className={classes.imageText}>
                    Upload your scores, arrange and sort them into instrument
                    specific documents.
                  </p>
                </Grid>
                <Grid item xs={1} className={classes.bottomPart}></Grid>
              </Grid>
              <Grid container spacing={8} className={classes.footer}>
                <Grid item xs={12} className={classes.footer}>
                  <p>
                    Copyright &copy; 2018 Bouvet AS - All rights reserved
                  </p>
                </Grid>
              </Grid>
            </div>
        );
    }
}


export default compose(connect(state => ({
    user: state.default.user,
})), withStyles(styles))(SignIn);
