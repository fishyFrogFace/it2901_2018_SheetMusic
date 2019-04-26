import React from 'react';
import { withStyles } from "material-ui/styles";
import {
  Avatar, Card, CardContent, CardMedia, CardActions, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Paper, SvgIcon,
  Typography, CardHeader, Divider, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Select, MenuItem, Tooltip, InputLabel, LinearProgress
} from "material-ui";
import DeleteIcon from 'material-ui-icons/Delete'
import { LibraryMusic, SortByAlpha, ViewList, ViewModule, MusicNote } from "material-ui-icons";
import NoteIcon from 'material-ui-icons/MusicNote';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import firebase from 'firebase';

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
  root: {
    flexGrow: 1,
  },
  card: {
    width: '65%',
    marginBottom: 20,
    cursor: 'pointer',

  },

  flex: {
    display: 'inline-flex',
    padding: '0px',
    position: 'sticky',
    top: 0,
    backgroundColor: '#f1f1f1',
    width: '100%',
    zIndex: 1
  },

  ellipsis: {
    overflowX: 'auto',
    cursor: 'default',
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
    },
    [theme.breakpoints.down('sm')]: {
      minWidth: '0px',
    },
    '&:hover': {
      background: '#e2e2e2'
    }
  },

  cardContent: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },

  actions: {
    marginTop: '8px',
    marginLeft: '-30px',
  },

  expandedPanel: {
    padding: '0px',
    cursor: 'default',
    overflowX: 'auto'
  },

  expandButton: {
    display: 'grid',
    padding: '0px',
    flexGrow: 'inherit',
    margin: '0px',
    '&:hover': {
      background: '#e2e2e2'
    },
    transitions: '1000ms'
  },


  expandedListItems: {
    paddingBottom: '0px',
    paddingTop: '0px',
  },

  metadata: {
  },

  media: {
    flex: 2,
    backgroundPosition: 'top',
    height: '160px'
  },

  media2: {
    flex: 1
  },

  selectArrangement: {
    padding: '8px'
  },

  progress: {
    color: 'black',
    paddingRight: '150px',
    margin: '50px',
    height: '50px',
  },

  checked: {
    color: 'green',
  },

  cardHeader: {
    cursor: 'default',
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingRight: '12px',
  },

  instrumentName: {
    flex: 0,
    marginRight: '80px',
  },

  partList: {
    padding: '0px',
    [theme.breakpoints.down('xs')]: {
      display: 'grid'
    },
  },

});

class Scores extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listView: false,
      bandtypes: [],
      bandtype: 'default',
      isLoaded: false,
      scoreInstruments: [],
      activeScore: '',
      sortedAlphabetically: false,
      defaultComposer: 'All Composers',
      chosenComposer: 'All Composers',
      allInstruments: [],
      allPartsInstrument: [],
      instrumentParts: [],
      vocalInstruments: {},
      expanded: null,
    };
  }

  unsubs = []

  componentWillMount() {
    if (window.localStorage.getItem('scoresListView')) {
      this.setState({ listView: true, });
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
    score = ''
  };

  // Closes the active expanded panel when next is activated
  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  onExpansionClick = (e) => {
    const parts = [];
    const instrumentType = [];

    for (let i = 0; i < (this.props.band.scores && (Object.keys(this.props.band.scores)).length); i++) {
      if (this.props.band.scores !== undefined && Object.keys(this.props.band).length > 10 && this.props.band.scores[i].parts !== undefined && e.target.id == i) {
        for (let k = 0; k < (this.props.band.scores[e.target.id].parts.length); k++) {
          let data = this.props.band.scores[i].parts[k].instrumentRef
          data.get().then(function (documentSnapshot) {
            const partsInstruments = documentSnapshot.data()
            instrumentType.push(partsInstruments.type)
            parts.push(partsInstruments)
          });
        }
      }
    }
    this.setState({
      activeScore: e.target.id,
    })

    // TODO: should use a callback on state or componentDidMount instead of setTimeout,
    // setting a timeout because we have to wait for the async calls to get instrument data
    setTimeout(() => {
      this.setState({
        scoreInstruments: instrumentType,
        instrumentParts: parts,
      })
      this.onGetInstrumentParts()
    }, 800);
  }

  onGetInstrumentParts = () => {
    const instrumentType = this.state.instrumentParts
    const allp = this.state.scoreInstruments
    const allParts = []
    const uniqueNames = []
    const instr = []
    let dict = {}
    let finalDictionary = {}
    let instrTypes = []

    let uniqeInstruments = (new Set(allp)); // get the uniqe instruments for each score
    for (let elem of instrumentType) {
      const fil = instrumentType.filter(item => item.type === elem.type) // filter out the parts data
      allParts.push(fil)
    }
    let UniqueallParts = Array.from(new Set(allParts.map(JSON.stringify)), JSON.parse) // remove duplicate arrays inside allParts-array

    for (let k = 0; k < uniqeInstruments.size; k++) {
      uniqueNames.push(UniqueallParts[k]) // get the uniqe parts to match the uniqe instrument

    }
    uniqueNames.map((item) => {
      for (let p = 0; p < item.length; p++) {
        instrTypes.push(item[p].name) // add all the instrument parts to one array
        instr.push(item[p].type) // add all the instruments to one array
      }
    })
    let uniqeInstr = [...new Set(instr)]; // exclude duplicates
    let uniqueVocal = [...new Set(instrTypes)] // exlude duplicates
    let sortedUniqeVocal = uniqueVocal.sort((a, b) => a.localeCompare(b)) // sort the instruments parts on name

    for (let h = 0; h < uniqeInstr.length; h++) {
      for (let g = 0; g < sortedUniqeVocal.length; g++) {
        if (sortedUniqeVocal[g].includes(uniqeInstr[h])) {
          dict[uniqeInstr[h]] = [...sortedUniqeVocal] // create dictionary with each instrument with all instrument parts
        }
      }
    }
    Object.keys(dict).forEach(function (key) {
      const matches = dict[key].filter(s => s.includes(key)); // filter out the instrument parts not match the instrument
      finalDictionary[key] = [matches] // create the final dictionary with all instrument and associated instrument part/vocal
    });

    this.setState({
      vocalInstruments: finalDictionary
    })
  }

  _onSortByAlphaClick = () => {
    let alpha = this.state.sortedAlphabetically;
    alpha = !alpha; // Changed between alphabetically and not
    this.setState({ sortedAlphabetically: alpha });
  };

  _changeComposer = (e) => {
    this.setState({ chosenComposer: e.target.value })
  };


  // mounting the instrument alternatives
  componentDidMount = () => {
    const instr = [];
    const allInstruments = [];
    const instrumentRef = firebase.firestore().collection('instruments');
    instrumentRef.get()
      .then(doc => {
        doc.forEach(item => {
          instr.push(item.data())
        })
        for (let elem of instr) {
          allInstruments.push(elem.name)

        }
      })
    this.setState({
      allInstruments: allInstruments,
    })

    setTimeout(() => {
      this.setState({
        isLoaded: true
      })
    }, 7000);
  }

  // get matching instruments from parts and bandtypes-instrument from db
  render() {
    const { classes, band, bands, loaded } = this.props;
    const { listView, isLoaded, expanded } = this.state;
    const hasScores = band.scores && band.scores.length > 0 && this.props.band.scores !== undefined;

    let scores = []; // Local variable to be able to switch back and forth between alphabetically and not, and filter on composer and instrument without influencing the original
    let composers = []; // --||--
    if (hasScores) { // Should not fetch band.scores if empty etc
      if (this.state.sortedAlphabetically) { // If alphabetically is chosen
        scores = band.scores.slice(); // Get default
        scores = scores.sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically by title
      }
      else {
        scores = band.scores.slice(); // Use default
      }

      if (this.state.chosenComposer !== this.state.defaultComposer) { // If not all composers (default) is chosen
        scores = scores.filter(score => score.composer === this.state.chosenComposer) // The scores are filtered on composer
      }

      // Make list of all available composers to use in <Select> menu
      composers.push(this.state.defaultComposer); // Get default
      band.scores.map(score => {
        if (!composers.includes(score.composer)) { // And all unique composer
          composers.push(score.composer);
          composers = composers.filter(function (element) {
            return element !== undefined; // filter out undefined values
          });
        }
      });

    }

    return <div className={this.state.hidden}>
      <div className={classes.flex} >
        <div
        />
        <IconButton>
          <SortByAlpha onClick={this._onSortByAlphaClick} />
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

        {/* Select the composer */}
        <div className={classes.selectArrangement}>
          <InputLabel style={{ padding: 5 }} htmlFor="composer"></InputLabel>
          <Select
            onChange={this._changeComposer}
            autoWidth
            value={this.state.chosenComposer}
            renderValue={() => this.state.chosenComposer}
            inputProps={{ id: 'composer' }}
          >
            {composers.map((composer, key) =>
              <MenuItem key={key} value={composer}>{composer}</MenuItem>)
            }
          </Select>
        </div>
      </div>

      <div>
        {/* the simple list view */}
        {
          listView && hasScores && bands &&
          <div style={{ width: '65%' }}>
            <Paper>
              <List>
                {
                  scores.map((score, index) =>
                    <ListItem key={index} dense button
                      onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                      <LibraryMusic color='action' />
                      <ListItemText primary={score.title} secondary={`Parts: ${1}`} />
                      <ListItemSecondaryAction onClick={() => this._onMoreClick}>
                        <CardActions disableActionSpacing >
                          <IconButton
                            // TODO: get same styling as member page
                            onClick={(e) => {
                              if (window.confirm('Are you sure you wish to delete this item?'))
                                this._onMoreClick(score, e)
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </CardActions>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )
                }
              </List>
            </Paper>
          </div>
        }

        {/* The detailed list view */}
        {
          !listView && hasScores &&
          <div style={{
            display: 'flex', flexWrap: 'wrap'
          }}>

            {/* map over the scores in the band to get correct database-information */}
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
                    action={<div className={classes.actions}>
                      <CardActions disableActionSpacing >
                        <IconButton

                          // TODO: get same styling as member page
                          onClick={(e) => {
                            if (window.confirm('Are you sure you wish to delete this item?'))
                              this._onMoreClick(score, e)
                          }}

                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </div>}
                    title={score.title}
                  />
                  <Divider />
                  <div className={classes.cardContent}>
                    <div className={classes.media2}
                    >
                      {loaded && score.parts == undefined && !isLoaded && // display progress bar while waiting for score parts to not be undefined,
                        // invokes an update after some second set in componentdidmount to update score.parts state
                        <div className={classes.root}>
                          <LinearProgress color="secondary" />
                        </div>}
                      {
                        loaded ?
                          <CardMedia
                            className={classes.media}
                            image={
                              score.parts == undefined ? // if not able to get the correct score part, dispaly default image
                                'http://personalshopperjapan.com/wp-content/uploads/2017/03/130327musicscore-1024x768.jpg'
                                :
                                score.parts[0].pages[0].originalURL
                            }
                            title={score.title}
                            onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                          />
                          :
                          <CardMedia
                            className={classes.media}
                            image={
                              'http://personalshopperjapan.com/wp-content/uploads/2017/03/130327musicscore-1024x768.jpg'
                            }
                            title={score.title}
                            onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                          />
                      }
                    </div>
                    {
                      <CardContent className={classes.ellipsis}>
                        <Typography variant='subheading' className={classes.metadata}>

                          {score.composer == undefined ? '' : `${'Composer: ' + score.composer}`}
                          {/* Hide the composer and arranger data if these field are not defined when uploading new score */}
                        </Typography>
                        <Typography variant='subheading' className={classes.metadata}>
                          {score.arranger == undefined ? '' : `${'Arranger: ' + score.arranger}`}
                        </Typography>
                        <Typography variant='subheading'>
                          {/* Parts: {score.partCount} */}
                        </Typography>

                      </CardContent>
                    }
                    {/* progress circle while waiting for the correct image to render */}
                  </div>

                  <div onClick={this.onExpansionClick} id={index}>
                    <ExpansionPanel id={index} expanded={expanded === index} onChange={this.handleChange(index)}
                      CollapseProps={{ unmountOnExit: true, timeout: 'auto' }} >
                      <ExpansionPanelSummary className={classes.expandButton} expandIcon={<ExpandMoreIcon id={index} />}
                        id={index} >
                        <Typography variant='subheading' className={classes.heading} id={index}>Toggle instruments</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails className={classes.expandedPanel}>
                        <Typography variant='subheading'>

                          {this.state.activeScore == index ?
                            <List>
                              {
                                Object.keys(this.state.vocalInstruments).map((instr, i) =>
                                  <ListItem key={i} className={classes.expandedListItems}>
                                    {
                                      <Tooltip title=''>
                                        <MusicNote color='action' />
                                      </Tooltip>
                                    }
                                    <ListItemText className={classes.instrumentName} primary={`${instr}: `} />
                                    <List>

                                      {/* {(band.scores[index].parts).map((elem, pindex) => {
                                      partImage = band.scores[index].parts[pindex].pages[0].croppedURL
                                      //console.log('partImage', partImage)
                                    })} */}

                                      <ListItem key={index} className={classes.partList}>
                                        {this.state.vocalInstruments[instr][0].map((item, vocalIndex) =>

                                          < ListItemText key={vocalIndex} className={classes.instrumentstyle} >
                                            {/* <img
                                              id={vocalIndex}
                                              style={{ height: '50', width: '150px' }}
                                              //hoverSrc={this.props.band.scores[index].parts[0].pages[0].croppedURL}
                                              src={partImage}
                                              onMouseOver={(e) => this.onHover(i, e)}
                                              onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}

                                            /> */}
                                            {/* {(band.scores[index].parts).map((test, testindex) =>
                                              (score.parts[testindex].pages || []).map((page, index) =>
                                                <img style={{ height: '50', width: '150px' }}
                                                  key={index}
                                                  className={classes.sheet}
                                                  //src={page.croppedURL}
                                                  id={testindex}
                                                  //onMouseOver={this.onHover}
                                                  onMouseOver={(e) => this.onHover(testindex, e)}
                                                  onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                                                />
                                              )
                                            )} */}
                                            {<div onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                                              {item}</div>}
                                          </ListItemText>

                                        )
                                        }

                                      </ListItem>
                                    </List>
                                  </ListItem>
                                )
                              }
                            </List>
                            : '' //Close the prev expansion panel when activating the next 

                          }
                        </Typography>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </div>

                </Card>
              )}
          </div>
        }
      </div>

    </div >
  }

}

// LinearDeterminate.propTypes = {
//   classes: PropTypes.object.isRequired,
// };

export default withStyles(styles)(Scores);