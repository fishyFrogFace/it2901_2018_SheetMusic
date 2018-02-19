import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from 'material-ui/styles';
import firebase from "firebase";

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import archiveImg from '../img/archive.png';
import loggingImg from '../img/logging.png';
import personalImg from '../img/personal.png';
import setlistImg from '../img/setlist.png';
import sheetImg from '../img/sheet1.png';

import {
    Button, Card, CardContent, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Menu, MenuItem,
    Snackbar, TextField, Paper, Grid, Icon
} from "material-ui";
import AddIcon from 'material-ui-icons/Add';
import MenuIcon from 'material-ui-icons/Menu';
import Copyright from 'material-ui-icons/Copyright'

export const signIn = provider => async dispatch => {
    const provider = new firebase.auth.GoogleAuthProvider();

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
      color: 'rgb(0,188,212)'
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
        this.props.dispatch(signIn('google'));
    }

    render() {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
              <Grid container spacing={8} alignItems={'center'} className={classes.header}>
                <Grid item xs={12} alignItems={'center'} className={classes.header}>
                  <div className={classes.captionBox}>
                    <h1 className={classes.caption}>Score Butler</h1>
                    <p className={classes.slogan}>The best way to store adfadfadsfsa</p>
                    <Button
                      variant='raised'
                      color='primary'
                      className={classes.button}
                      onClick={() => this._onSignIn('google')}>
                      Sign in with Google
                    </Button>
                    <Button
                      variant='raised'
                      color='primary'
                      className={classes.button}>
                      Sign in with Facebook
                    </Button>
                  </div>
                </Grid>
              </Grid>
              <Grid container spacing={8} className={classes.midPart}>
                <Grid item xs={12} className={classes.midPart}>
                  <p className={classes.description}>
                    Some text about ScoreButler to describe the awsomeness
                    it has that really makes you want to have it!
                    Some text about ScoreButler to describe the awsomeness
                    it has that really makes you want to have it!
                    Some text about ScoreButler to describe the awsomeness
                    it has that really makes you want to have it!
                    Some text about ScoreButler to describe the awsomeness
                    it has that really makes you want to have it!
                  </p>
                </Grid>
              </Grid>
              <Grid container spacing={12} className={classes.bottomPart}>
                <Grid item xs={1} className={classes.bottomPart}></Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={archiveImg} className={classes.image} />
                  <p className={classes.imageText}>
                    Some text about the feature Some text about the feature
                    Some text about the featureSome text about the feature
                    Some text about the featureSome text about the feature
                  </p>
                </Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={loggingImg} className={classes.image} />
                  <p className={classes.imageText}>
                    Some text about the feature Some text about the feature
                    Some text about the featureSome text about the feature
                    Some text about the featureSome text about the feature
                  </p>
                </Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={personalImg} className={classes.image} />
                  <p className={classes.imageText}>
                    Some text about the feature Some text about the feature
                    Some text about the featureSome text about the feature
                    Some text about the featureSome text about the feature
                  </p>
                </Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={setlistImg} className={classes.imageSpecial} />
                  <p className={classes.imageText}>
                    Some text about the feature Some text about the feature
                    Some text about the featureSome text about the feature
                    Some text about the featureSome text about the feature
                  </p>
                </Grid>
                <Grid item xs={2} className={classes.bottomPart}>
                  <img src={sheetImg} className={classes.image} />
                  <p className={classes.imageText}>
                    Some text about the feature Some text about the feature
                    Some text about the featureSome text about the feature
                    Some text about the featureSome text about the feature
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
