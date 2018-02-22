import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';
import firebase from "firebase";
import style from './signin.css';

import download from '../img/Sheetmusic_illustrations_logging.svg';
import setlist from '../img/setlist.svg';
import arrangement from '../img/arrangement.svg';
import sheet from '../img/sheet.svg';
import g_logo from '../img/google-logo-icon-PNG-Transparent-Background.png';
import f_logo from '../img/facebook-flat-vector-logo.png';

import MenuIcon from 'material-ui-icons/Menu';

import MediaQuery from 'react-responsive';

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
  button: {
    margin: '5px',
    background: 'rgb(255,255,255)',
    color: 'rgb(0,188,212)',
    height: '40px',
    width: '220px',
  }
}

class SignIn extends Component {
    componentWillMount() {
    }

    _onSignIn(provider) {
        this.props.dispatch(signIn(provider));
    }

    render() {
        const {classes} = this.props;

        return (
            <div className={style.root}>
              <AppBar position='static'>
                <Toolbar>
                  <IconButton className={style.menuButton} color="inherit" aria-label="Menu">
                    <MenuIcon />
                  </IconButton>
                </Toolbar>
              </AppBar>
              <Grid container spacing={8}>
                <Grid item xs={12} alignItems={'center'} className={style.header}>
                  <div className={style.captionBox}>
                    <h1 className={style.caption}>Score Butler</h1>
                    <p className={style.slogan}>The best way to store your sheets</p>
                    <Button
                      variant='raised'
                      className={classes.button}
                      onClick={() => this._onSignIn('google')}>
                      <img src={g_logo} className={style.googleLogo}/>
                      Sign in with Google
                    </Button>
                    {/* <Button
                      variant='raised'
                      className={classes.button}
                      onClick={() => this._onSignIn('facebook')}>
                      <img src={f_logo} className={style.facebookLogo}/>
                      Sign in with Facebook
                    </Button> */}
                  </div>
                </Grid>
                <Grid item xs={12} className={style.midPart}>
                    <div className={style.midPart}>
                      <p className={style.description}>
                        ScoreButler is a tool which allows ensembles to upload
                        and archive all their scores.

                        It helps the band easily create arrangements and setlists
                        containing detailed information about the entire event.
                      </p>
                      <p className={style.description}>
                        Get started today, with the #1 online score manager.
                      </p>
                    </div>
                </Grid>
                <Grid item xs={6} sm={3} className={style.bottomPart}>
                  <img src={sheet} className={style.image} />
                  <p className={style.imageText}>
                    Upload your scores, arrange and sort them into instrument
                    specific documents.
                </p>
                </Grid>
                <Grid item xs={6} sm={3} className={style.bottomPart}>
                <img src={arrangement} className={style.image} />
                <p className={style.imageText}>
                  Archive all your bands scores, and access them everywhere.
                </p>
                </Grid>
                <Grid item xs={6} sm={3} className={style.bottomPart}>
                  <img src={setlist} className={style.image} />
                  <p className={style.imageText}>
                    Create setlists for your band which contain arrangements
                    and other events during a set, in a chronological order.
                </p>
                </Grid>
                <Grid item xs={6} sm={3} className={style.bottomPart}>
                  <img src={download} className={style.image} />
                  <p className={style.imageText}>
                    Download your part of the set.
                </p>
                </Grid>
                <Grid item xs={12} className={style.footer}>
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
