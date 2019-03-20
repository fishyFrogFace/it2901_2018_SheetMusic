import React from 'react';
import { withStyles } from "material-ui/styles";
import {
  Avatar, Card, CardContent, CardMedia, CardActions, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Paper, SvgIcon,
  Typography, CardHeader, Divider, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary
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
import SelectComposer from '../../components/SelectComposer'

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
const styles = {
  root: {},
  card: {
    width: '100%',
    marginRight: 20,
    marginBottom: 20,
    cursor: 'pointer'
  },
  media: {
    flex: 2
  },

  flex: {
    flex: 1
  },

  ellipsis: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    width: '100%',
    flex: 1,
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
    marginBottom: '-30px',
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

  cardHeader: {
    cursor: 'default'
  },
};

class Scores extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listView: false,
      sortedAlphabetically: false,
      expanded: false,
      parts: {},
      score: {},
      vocal: '',
      composers: [],
      activeInstrument: 'Default',
      activeInstrumentList: ['Trombone', 'Trumpet', 'Flute', 'Cello', 'Piano', 'Sax', 'Drum'],
      optionsdata: [
        { key: '101', value: 'Default', instruments: ['Trombone', 'Trumpet', 'Flute', 'Cello', 'Piano', 'Sax', 'Drum'] },
        { key: '102', value: 'Jazz Orchestra', instruments: ['Banjo', 'Bass', 'Drums', 'Guitar', 'Piano', 'Clarinet', 'Sax', 'Trombone', 'Trumpet', 'Tuba', 'Violin', 'Cello'] },
        { key: '103', value: 'Chamber Orchestra', instruments: ['Trombone', 'Trumpet'] },
        { key: '104', value: 'Symphony Orchestra', instruments: ['Piano', 'Clarinet', 'Sax'] },
      ]
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

  _onSortByAlphaClick = () => {
    let alpha = this.state.sortedAlphabetically;
    alpha = !alpha; // Changed between alphabetically and not
    this.setState({sortedAlphabetically: alpha});
  };


  _onGetParts = (band, score) => {
    const bandRef = firebase.firestore().doc(`bands/${band.id}`);
    const scoreDoc = bandRef.collection('scores').doc(score.id);
    let testList = []
    this.unsubs.forEach(unsub => unsub());
    this.unsubs.push(
      scoreDoc.collection('parts').onSnapshot(async snapshot => {
        const parts = await Promise.all(
          snapshot.docs.map(async doc => ({
            ...doc.data(),
            id: doc.id,
            instrument: (await doc.data().instrumentRef.get()).data()
          }))
        );
        const partsSorted = parts
          .sort((a, b) => a.instrument.name.localeCompare(b.instrument.name));
        this.setState({ score: { ...this.state.score, parts: partsSorted } });
        parts.forEach(element => {
          testList.push(element.instrument.name)
        })
        this.setState({
          testList: testList,
        })

      })
    );
    return testList
  }

  _onGetAllScores = async (band) => {
    let allscoresList = [];
    let tList = [];
    var bandRef = firebase.firestore().doc(`bands/${band.id}`);
    var citiesRef = bandRef.collection('scores');
    citiesRef.get()
      .then(async snapshot => {
        snapshot.forEach(async doc => {
          tList.push(doc.data())
          const scoreDoc = await bandRef.collection('scores').doc(doc.id);
          const partsRef = scoreDoc.collection('parts');
          var allScores = partsRef.get()
            .then(snapshot => {
              snapshot.forEach(doc => {
                allscoresList.push(doc.data().instrumentRef.id);
                // this.setState((prevallscoreList, allscoresList) => {
                //   allscoresList: prevallscoreList.allscoresList + allscoresList.allscoresList
                // })
                return allscoresList
              });
            })
            .catch(err => {
              console.log('Error getting documents', err);
            });
        })
      });
    setTimeout(() => {
      console.log('allscoresList', allscoresList)
      return allscoresList
    }, 3000);
  }

  _onGetScores = (band) => {
    let scoreList = [];
    let partList = [];
    // let partList = [ {"score": {"scoreId": "JAFSASF", "parts": {"instrument1": "trumpet", "instrument2": "bass"} } } ];
    const bandRef = firebase.firestore().doc(`bands/${band.id}`);
    const scoreRef = bandRef.collection('scores');
    console.log('scoreRef', scoreRef)
    const scores = scoreRef.get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          scoreList.push(doc)
          const scoreDoc = bandRef.collection('scores').doc(doc.id);
          const partsRef = scoreDoc.collection('parts');
          let parts = partsRef.get()
            .then(async snapshot => {
              const nextUser = { ...doc.data() };
              const parts = await Promise.all(
                snapshot.docs.map(async doc => ({
                  //partList.push(doc.data().instrumentRef.id))
                  ...doc.data(),
                  id: doc.id,
                  instrument: (await doc.data().instrumentRef.get()).data(),
                }
                )
                )
              );

              parts.forEach(element => {

                partList.push(element.instrument.name)
              })
              // .catch(err => {
              //   console.log('Error getting documents', err);
              // });
            });
        })
        // .catch(err => {
        //   console.log('Error getting documents', err);
        // });
      })

    setTimeout(() => {
      console.log('partList', partList)
      // this.setState({
      //   partListState: partList
      // })
      return partList
    }, 3000);

  }

  // handlechange the value of the onChange in <select /> in selectArrangement.js
  handleChange = (e) => {
    var value = this.state.optionsdata.filter(function (item) {
      return item.key == e.target.value
    })
    this.setState({ activeInstrument: value[0].value, activeInstrumentList: value[0].instruments })
  }

  changeComposer = (composers) => {
      this.setState({composers: composers})
  };


  render() {
    const { classes, band } = this.props;
    const { listView } = this.state;
    const hasScores = band.scores && band.scores.length > 0;
    let scores = []; // Local variable to be able to switch back and forth between alphabetically and not
    if (hasScores) { // Should not fetch band.scores if empty
        if (this.state.sortedAlphabetically) { // If alphabetically is chosen
            scores = band.scores.slice(); // Get default
            scores = scores.sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically by title
        }
        else {
            scores = band.scores.slice(); // Use default
        }
    }

    let test = {
      liste: ['instrument-tone1', 'instrument-tone2', 'instrument-tone3', 'instrument-tone4',] // midlertidig deklarasjon av toner
    }
    return <div>
      <div>
        <div className={classes.flex}>
            <IconButton onClick={this._onSortByAlphaClick}>
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
              <SelectComposer onChange={this.changeComposer} optionsdata={this.state.activeInstrumentList}/>
      </div>
      </div>
      <div>
        {/* the simple list view */}
        {
          listView && hasScores &&
          <Paper>
            <List>
                {/* uses the local variable scores */}
                {
                scores.map((score, index) =>
                  <ListItem key={index} dense button
                    onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                    <LibraryMusic color='action' />
                    <ListItemText primary={score.title} />
                    <ListItemSecondaryAction onClick={() => this._onMoreClick}>
                      <IconButton style={{ right: 0 }} onClick={() => this._onMoreClick}>
                        <MoreVertIcon onClick={() => this._onMoreClick} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>)
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
            {/* uses the local variable scores */}
            {
              scores.map((score, index) =>
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
                    <CardMedia
                      className={classes.media}
                      image='http://personalshopperjapan.com/wp-content/uploads/2017/03/130327musicscore-1024x768.jpg'
                      title="default-image"
                      onClick={() => window.location.hash = `#/score/${band.id}${score.id}`} />
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
                          <IconButton aria-label="Add to favorites">
                            <FavoriteIcon />
                          </IconButton>
                        </CardActions>
                      </div>
                    </CardContent>
                  </div>

                  {/* The toggle panel and content */}
                  <ExpansionPanel>
                    <ExpansionPanelSummary className={classes.expandButton} expandIcon={<ExpandMoreIcon />}>
                      <Typography variant='subheading' className={classes.heading}>Toggle instruments</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.expandedPanel}>
                      <Typography variant='subheading'>
                        <SelectArrangement
                          vocalValue={this.state.vocal}
                          ensemble={this.state.ensemble}
                          scoresID={score.id}
                          onChange={this.handleChange}
                          optionsdata={this.state.optionsdata}
                          activeInstrument={this.state.activeInstrument} />

                        <List>
                          {/* map over the instruments handled by stated set in the handleChange method, 
                          to display correct instruments for the arrangement selected */}
                          {
                            this.state.activeInstrumentList.map((instruments, index) =>
                              <ListItem key={index} className={classes.expandedListItems}>
                                <LibraryMusic color='action' />
                                <ListItemText primary={`${instruments}: `} />
                                <List>
                                  <InstrumentScores
                                    test={test}
                                    testList={this.state.testList}
                                    _onGetParts={this._onGetParts.bind(this)}
                                    _onGetAllScores={this._onGetAllScores.bind(this)}
                                    allscoresList={this.state.allscoresList} />
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
    </div>
  }
}

export default withStyles(styles)(Scores);
