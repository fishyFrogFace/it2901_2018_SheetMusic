import React from 'react';
import { withStyles } from "material-ui/styles";
import {
  Avatar, Card, CardContent, CardMedia, CardActions, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Paper, SvgIcon,
  Typography, CardHeader, Divider, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Select, MenuItem, CircularProgress,
} from "material-ui";
import MoreVertIcon from 'material-ui-icons/MoreVert';
import DeleteIcon from 'material-ui-icons/Delete'
import { LibraryMusic, SortByAlpha, ViewList, ViewModule } from "material-ui-icons";
import NoteIcon from 'material-ui-icons/MusicNote';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import FavoriteIcon from 'material-ui-icons/Favorite';
import firebase from 'firebase';
import InstrumentScores from '../../components/InstrumentScores';
import SelectArrangement from '../../components/SelectArrangement';

function InstrumentIcon(props) {
  const extraProps = {
    nativeColor: 'rgba(0, 0, 0, 0.38)'
  };

  return <SvgIcon {...props} {...extraProps}>
    <path stroke="null" id="svg_3"
      d="m9.129966,12.700415l-6.509846,5.929c-0.822946,0.774643 -0.842666,2.076245 -0.0435,2.875411c0.80061,0.80061 2.105102,0.779173 2.878965,-0.047327l5.802835,-6.420152l-2.128453,-2.336933z" />
    <path stroke="null" id="svg_6"
      d="m19.14156,6.035508c-0.224411,-0.120582 -0.435234,-0.275096 -0.624424,-0.464286c-0.210237,-0.210276 -0.378184,-0.447027 -0.503881,-0.699631c-0.045062,-0.090592 -0.162949,-0.114412 -0.23718,-0.045687l-5.057634,4.606312l1.984794,1.793925l4.479717,-4.956381c0.066851,-0.072669 0.045648,-0.18755 -0.041391,-0.234252z" />
    <path stroke="null" id="svg_9"
      d="m21.522891,2.565427c-0.296417,-0.296456 -0.690611,-0.459717 -1.109835,-0.459717s-0.813379,0.163301 -1.109835,0.459717c-0.611967,0.611928 -0.611967,1.607664 0,2.21967c0.611967,0.611928 1.607703,0.611928 2.21967,0c0.296456,-0.296456 0.459717,-0.690572 0.459717,-1.109796s-0.163301,-0.813379 -0.459717,-1.109874z" />
    <path stroke="null" id="svg_12"
      d="m21.345103,18.629376l-15.18778,-13.727446c-0.072708,-0.06689 -0.187589,-0.045648 -0.23433,0.041391c-0.120582,0.224411 -0.275096,0.435234 -0.464286,0.624424c-0.210237,0.210198 -0.447027,0.378184 -0.699631,0.503881c-0.090592,0.045062 -0.114412,0.162949 -0.045687,0.237219l13.80359,15.155994c0.774643,0.823024 2.076245,0.842666 2.875411,0.0435c0.800571,-0.80065 0.779173,-2.105102 -0.047288,-2.878965z" />
    <path stroke="null" id="svg_15"
      d="m4.672662,2.561991c-0.296456,-0.296417 -0.690611,-0.459717 -1.109835,-0.459717s-0.813379,0.163301 -1.109835,0.459717c-0.296495,0.296417 -0.459717,0.690611 -0.459717,1.109835s0.163301,0.813379 0.459717,1.109835c0.611967,0.611967 1.607664,0.611967 2.21967,0c0.611928,-0.611967 0.611928,-1.607703 0,-2.21967z" />

  </SvgIcon>;
}
const styles = theme => ({
  root: {},
  card: {
    width: '75%',
    marginBottom: 20,
    cursor: 'pointer',

  },
  media: {
    flex: 2
  },

  flex: {
    display: 'inline-flex',
    padding: '0px'
  },

  ellipsis: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    width: '100%',
    flex: 0.8,
    '&:last-child': {
      paddingBottom: '0px',
    }
  },

  instrumentstyle: {
    borderStyle: 'groove',
    borderWidth: '1px',
    padding: '8px',
    margin: '5px',
    cursor: 'pointer',
    minWidth: '80px',
    textAlign: 'center',
    '&:first-child': {
      paddingLeft: '8px',
    }
  },

  cardContent: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },

  actions: {
    marginTop: '33px',
    marginLeft: '-30px',
  },

  expandedPanel: {
    padding: '0px',
    cursor: 'default',
  },

  expandButton: {
    '&:hover': {
      background: '#e2e2e2'
    }
  },

  expandedListItems: {
    paddingBottom: '0px',
    paddingTop: '0px',
    marginBottom: '-30px'
  },

  metadata: {
  },

  media: {
    flex: 1,
    backgroundPosition: 'top',
    height: '160px'
  },

  selectArrangement: {
    display: 'flex'
  },

  progress: {
    margin: theme.spacing.unit * 2,
    color: 'black',
    adding: '40px',
    paddingLeft: '400px',
    paddingRight: '300px',
    width: '50px',
    height: '30px',
  },

  cardHeader: {
    cursor: 'default'
  },
});

class Scores extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      props,
      listView: false,
      instruments: [],
      selected: false,
      cardIds: [],
      bandtypes: [],
      bandtype: '',
      parts: {},
      score: {},
      band: {},
      isLoaded: false,
    };
  }

  unsubs = []

  componentWillMount() {
    if (window.localStorage.getItem('scoresListView')) {
      this.setState({ listView: true });
    }
  }

  _onViewModuleClick = () => {
    window.localStorage.removeItem('scoresListView');
    this.setState({ listView: false });
  };

  _onViewListClick = () => {
    window.localStorage.setItem('scoresListView', 'true');
    this.setState({ listView: true });
  };

  _onMoreClick = (score) => {
    this.props.onRemoveScore(score);
  };

  _onSelectChange = event => {
    var bandtypeInstruments = this.state.bandtypes.filter(function (item) {
      return item.name == event.target.value
    })
    this.setState({ bandtype: event.target.value, selected: true, instruments: bandtypeInstruments[0].instruments });
  };

  componentWillReceiveProps(props) {
    for (let i = 0; i < (props.band.scores && (Object.keys(props.band.scores)).length); i++) {
      if (props.band.scores !== undefined && Object.keys(props.band).length > 10 && props.band.scores[i].parts !== undefined) {
        this.setState({
          isLoaded: true,
          bandtype: props.band.bandtype,
          band: this.props.band,
          bandtypes: this.state.bandtypes
        })
      }
      else {
        this.setState({
          isLoaded: false
        })
      }
    }

  }

  componentDidMount = () => {
    const types = [];
    const bandtypeRef = firebase.firestore().collection('bandtype');
    bandtypeRef.get()
      .then(docs => {
        docs.forEach(doc => {
          types.push(doc.data())
        });
      })
      .catch(err => {
        console.log('Error getting bandtypes', err);
      });

    this.setState({ bandtypes: types })
  }

  render() {
    const { classes, band } = this.props;
    const { listView, isLoaded } = this.state;
    const hasScores = band.scores && band.scores.length > 0;
    let test = {
      liste: ['instrument-tone1', 'instrument-tone2', 'instrument-tone3', 'instrument-tone4',] // midlertidig deklarasjon av toner
    }

    isLoaded && console.log('this.state.bandtypes', this.state.bandtypes)
    isLoaded && console.log('this.props.band', this.props.band)

    return <div>

      < div className={classes.flex} >
        <div
        />
        <IconButton>
          <SortByAlpha />
        </IconButton>
        {
          listView &&
          <IconButton onClick={this._onViewModuleClick}>
            <ViewModule />
          </IconButton>
        }
        {
          !listView &&
          <IconButton onClick={this._onViewListClick}>
            <ViewList />
          </IconButton>
        }
        {
          !listView &&
          <div className={classes.selectArrangement}>
            <SelectArrangement
              bandtypes={this.state.bandtypes}
              bandtype={this.state.bandtype}
              band={band}
              onChange={this._onSelectChange}
            />
          </div>
        }
      </div >

      <div>
        {/* the simple list view */}
        {
          listView && hasScores &&
          <Paper>
            <List>
              {
                band.scores.map((score, index) =>
                  <ListItem key={index} dense button
                    onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                    <LibraryMusic color='action' />
                    <ListItemText primary={score.title} />
                    <ListItemSecondaryAction onClick={() => this._onMoreClick}>
                      <IconButton style={{ right: 0 }} onClick={() => this._onMoreClick}>
                        <MoreVertIcon onClick={() => this._onMoreClick} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              }
            </List>
          </Paper>
        }

        {/* The detailed list view */}
        {
          !listView && hasScores &&
          <div style={{
            display: 'flex', flexWrap: 'wrap'
          }}>
            {/* map over the scores in the band to get correct database-information */}
            {
              band.scores.map((score, index) =>
                <Card className={classes.card} key={index}
                  elevation={1}>
                  <CardHeader
                    className={classes.cardHeader}
                    avatar={
                      <Avatar aria-label="Note" className={classes.avatar}>
                        <NoteIcon />
                      </Avatar>
                    }
                    action={
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    }
                    title={score.title}
                  />
                  <Divider />
                  <div className={classes.cardContent}>
                    {isLoaded ?
                      <CardMedia
                        className={classes.media}
                        image={isLoaded ? band.scores[index].parts[0].pages[0].originalURL : 'http://personalshopperjapan.com/wp-content/uploads/2017/03/130327musicscore-1024x768.jpg'}
                        title="default-image"
                        onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                      />
                      : <CircularProgress className={classes.progress} />}

                    <CardContent className={classes.ellipsis}>
                      <Typography variant='subheading' className={classes.metadata}
                        onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                        Composer:  {score.composer}
                      </Typography>
                      <Typography variant='subheading'
                        onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                        Parts: {score.partCount}
                      </Typography>
                      <div className={classes.actions}>
                        <CardActions disableActionSpacing >
                          <IconButton onClick={(e) => this._onMoreClick(score, e)}>
                            <DeleteIcon />
                          </IconButton>

                        </CardActions>
                      </div>
                    </CardContent>
                  </div>



                  <ExpansionPanel>
                    <ExpansionPanelSummary className={classes.expandButton} expandIcon={<ExpandMoreIcon />}
                      id={index} >
                      <Typography variant='subheading' className={classes.heading}>Toggle instruments</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.expandedPanel}>


                      <Typography variant='subheading'>
                        <List>
                          {this.state.instruments.map((instruments, index) =>
                            <ListItem key={index} className={classes.expandedListItems}>
                              <LibraryMusic color='action' />
                              <ListItemText primary={`${instruments}: `} />
                              <List>
                                <InstrumentScores
                                  test={test}
                                  testList={this.state.testList}
                                  band={this.props.band}
                                />
                                {
                                  <ListItem>
                                  </ListItem>
                                }
                              </List>
                            </ListItem>
                          )}
                        </List>

                      </Typography>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                </Card>
              )}
          </div>
        }
      </div>
    </div >
  }




}

export default withStyles(styles)(Scores);
