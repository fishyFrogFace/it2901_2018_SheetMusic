import React from 'react';
import { withStyles } from "material-ui/styles";
import {
  Avatar, Card, CardContent, CardMedia, CardActions, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Paper, SvgIcon,
  Typography, CardHeader, Divider, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Select, MenuItem, CircularProgress, Tooltip, InputLabel,
} from "material-ui";
import MoreVertIcon from 'material-ui-icons/MoreVert';
import DeleteIcon from 'material-ui-icons/Delete'
import { LibraryMusic, SortByAlpha, ViewList, ViewModule, MusicNote, Error } from "material-ui-icons";
import NoteIcon from 'material-ui-icons/MusicNote';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import FavoriteIcon from 'material-ui-icons/Favorite';
import firebase from 'firebase';
import InstrumentScores from '../../components/InstrumentScores';
import SelectArrangement from '../../components/SelectArrangement';
import { elementType } from 'prop-types';

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
    padding: '0px',
    position: 'sticky',
    top: 0,
    backgroundColor: '#f1f1f1',
    width: '100%',
    zIndex: 1
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
    display: 'grid',
    padding: '0px',
    flexGrow: 'inherit',
    margin: '0px',
    '&:hover': {
      background: '#e2e2e2'
    }
  },

  expandedListItems: {
    paddingBottom: '0px',
    paddingTop: '0px',
    //marginBottom: '-30px'
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
    // margin: theme.spacing.unit * 2,
    color: 'black',
    paddingRight: '150px',
    margin: '50px',
    height: '50px',
  },

  checked: {
    color: 'green',
  },

  cardHeader: {
    cursor: 'default'
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
});

class Scores extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      listView: false,
      instruments: [],
      selected: false,
      bandtypes: [],
      bandtype: 'default',
      band: {},
      isLoaded: false,
      matchingInstruments: [],
      expansionIsClicked: false,
      scoreInstruments: [],
      activeScore: '',
      sortedAlphabetically: false,
      defaultComposer: 'All Composers',
      chosenComposer: 'All Composers',
      defaultInstrument: 'All Instruments',
      chosenInstrument: 'All Instruments',
      allInstruments: [],
      allPartsInstrument: [],
      instrumentParts: [],
      vocalInstruments: {},
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

  // used on onChange for the orchestra alternatives, changing the state of instruments in the 
  // expansion panel menu, so it get the correct bandtype-list from the db. 
  _onSelectChange = event => {
    var bandtypeInstruments = this.state.bandtypes.filter(function (item) {
      return item.name == event.target.value
    })
    setTimeout(() => {
      if (this.state.activeScore) {
        this.onGetMatchnigScores()
        // get matching scores when changing ensemble, timeout because waiting for state.instruments in onExpansionClick
      }
    }, 700);
    this.setState({ bandtype: event.target.value, selected: true, instruments: bandtypeInstruments[0].instruments });
  };


  // The props renders too early, therefore this function set a state for isLoaded to correctly render the 
  // image urls for each scrore
  componentWillReceiveProps = (props) => {
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

  onHandleFallback = () => {
    if (this.state.isLoaded === false
      //&& this.props.band.bandtype
    ) {
      setTimeout(function () {
        for (let i = 0; i < (this.props.band.scores && (Object.keys(this.props.band.scores)).length); i++) {
          if (this.props.band.scores !== undefined && Object.keys(this.props.band).length > 10 && this.props.band.scores[i].parts !== undefined) {
            this.setState({
              isLoaded: true
            })
          }
          else {
            // if not able to retrieve props, wait another 4 seconds
            setTimeout(function () {
              for (let i = 0; i < (this.props.band.scores && (Object.keys(this.props.band.scores)).length); i++) {
                if (this.props.band.scores !== undefined && Object.keys(this.props.band).length > 10 && this.props.band.scores[i].parts !== undefined) {
                  this.setState({
                    isLoaded: true
                  })
                }
              }
            }.bind(this), 4000);  // wait 4 seconds, then isLoaded: true
          }
        }
      }.bind(this), 500);  // wait 0.5 seconds, then isLoaded: true
    }
  }

  onGetAllInstruments = () => {
    let allPartsInstruments = []
    for (let i = 0; i < (this.props.band.scores && (Object.keys(this.props.band.scores)).length); i++) {
      if (this.props.band.scores !== undefined && Object.keys(this.props.band).length > 10 && this.props.band.scores[i].parts !== undefined) {
        for (let k = 0; k < (this.props.band.scores[i].partCount); k++) {
          let data = this.props.band.scores[i].parts[k].instrumentRef
          data.get().then(function (documentSnapshot) {
            const partsInstruments = documentSnapshot.data()
            allPartsInstruments.push(partsInstruments.name)

          });
        }
      }
    }
    setTimeout(() => {
      this.setState({
        allPartsInstruments: allPartsInstruments
      })
    }, 500);
  }

  onExpansionClick = (e) => {
    const types = [];
    let instr = [];
    const parts = [];
    const instrumentType = [];
    const bandtypeRef = firebase.firestore().collection('bandtype');
    bandtypeRef.get()
      .then(docs => {
        docs.forEach(doc => {
          types.push(doc.data())
        });
        for (let elements of types) {
          if (this.state.expansionIsClicked === false && elements.name.trim() === this.props.band.bandtype.trim()) {
            instr.push(...elements.instruments)
            this.setState({
              instruments: instr,
              expansionIsClicked: true,
            })
          }
          else {
            instr = []
          }
        }
      })
      .catch(err => {
        console.log('Error getting bandtypes', err);
      });

    for (let i = 0; i < (this.props.band.scores && (Object.keys(this.props.band.scores)).length); i++) {
      if (this.props.band.scores !== undefined && Object.keys(this.props.band).length > 10 && this.props.band.scores[i].parts !== undefined && e.target.id == i) {
        for (let k = 0; k < (this.props.band.scores[i].partCount); k++) {
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
      activeScore: e.target.id
    })

    setTimeout(() => {
      this.setState({
        scoreInstruments: instrumentType,
        instrumentParts: parts
      })
      this.onGetMatchnigScores()
      this.onGetInstrumentParts()
    }, 500);
  }

  onGetMatchnigScores = () => {
    const instrumentType = this.state.scoreInstruments
    const intersection = this.state.isLoaded && this.state.instruments.filter(element => instrumentType.includes(element));
    this.setState({
      matchingInstruments: intersection
    })
  }

  onGetInstrumentParts = () => {
    let instrumentType = this.state.instrumentParts
    let allp = this.state.scoreInstruments
    let allParts = []
    let uniqueNames = []
    let instr = []
    let dict = {}
    let finalDictionary = {}
    let instrTypes = []

    let uniqeInstruments = (new Set(allp)); // get the uniqe instruments for each score

    for (let elem of instrumentType) {
      const fil = instrumentType.filter(item => item.type === elem.type) // filter out the parts data
      allParts.push(fil)
    }
    for (let k = 0; k < uniqeInstruments.size; k++) {
      uniqueNames.push(allParts[k]) // get the uniqe parts to match the uniqe instrument

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
    console.log('finalDictionary', finalDictionary)

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

  _changeInstrument = (e) => {
    this.setState({ chosenInstrument: e.target.value })

  };

  _instrumentInScore(instrument, score) {
    let inScore = false;
    this.state.allInstruments.map(instrumentInScore => {
      if (instrumentInScore === instrument) {
        inScore = true;
      }
    });
    return inScore;
  }

  // mounting the orchestra alternatives
  componentDidMount = () => {
    const types = [];
    const ball = [];
    const allInstruments = [];
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
    this.setState({ bandtypes: types, })

    const instrumentRef = firebase.firestore().collection('instruments');
    instrumentRef.get()
      .then(dok => {
        dok.forEach(item => {
          ball.push(item.data())
        })
        for (let elem of ball) {
          //console.log('elem', elem.name)
          allInstruments.push(elem.name)

        }
      })
    this.setState({
      allInstruments: allInstruments
    })
  }

  // get matching instruments from parts and bandtypes-instrument from db
  //TODO: get instruments from parts and use it instead of test-list
  render() {
    const { classes, band } = this.props;
    const { listView, isLoaded, matchingInstruments, timeout } = this.state;
    const hasScores = band.scores && band.scores.length > 0;

    let test = {
      liste: ['instrument-tone1', 'instrument-tone2', 'instrument-tone3', 'instrument-tone4',] // midlertidig deklarasjon av toner
    }




    let scores = []; // Local variable to be able to switch back and forth between alphabetically and not, and filter on composer and instrument without influencing the original
    let composers = []; // --||--
    let instruments = []; // --||--
    if (hasScores) { // Should not fetch band.scores if empty
      if (this.state.sortedAlphabetically) { // If alphabetically is chosen
        scores = band.scores.slice(); // Get default
        scores = scores.sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically by title
      } else {
        scores = band.scores.slice(); // Use default
      }
      if (this.state.chosenComposer !== this.state.defaultComposer) { // If not all composers (default) is chosen
        scores = scores.filter(score => score.composer === this.state.chosenComposer) // The scores are filtered on composer
      }
      let chosenInstrument = this.state.chosenInstrument;
      if (chosenInstrument !== this.state.defaultInstrument) { // If not all instruments (default) is chosen
        scores = scores.filter(score => this._instrumentInScore(chosenInstrument, score)) // The scores are filtered on instrument
      }
      // Make list of all available composers
      composers.push(this.state.defaultComposer); // Get default
      band.scores.map(score => {
        if (!composers.includes(score.composer)) { // And all unique composer
          composers.push(score.composer)
        }
      });
      // Make list of all available instruments
      if (band.scores.parts) {
        band.scores.map(score => {
          let parts = this._onGetParts(band, score);

          parts.map(instrument => {
            if (!instruments.includes(instrument)) { // And all unique instruments
              instruments.push(instrument)
            }
          })
        })
      }
    }

    return <div className={this.state.hidden}>
      < div className={classes.flex} >
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
        {
          !listView && band.bandtype &&
          <div className={classes.selectArrangement}>
            <SelectArrangement
              bandtypes={this.state.bandtypes}
              bandtype={this.state.bandtype}
              defaultBandtype={band.bandtype}
              band={band}
              onChange={this._onSelectChange}
              instruments={this.state.instruments}
            />
          </div>
        }

        <div>
          <InputLabel style={{ padding: 5 }} htmlFor="composer">Composer:</InputLabel>
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

        <div>
          <InputLabel style={{ padding: 5 }} htmlFor="instrument">Instrument:</InputLabel>
          <Select
            onChange={this._changeInstrument}
            autoWidth
            value={this.state.chosenInstrument}
            renderValue={() => this.state.chosenInstrument}
            inputProps={{ id: 'instrument' }}
            id="filterInstrument"
          >
            {this.state.allInstruments.map((instrument, key) =>
              <MenuItem key={key} value={instrument}>{instrument}</MenuItem>)
            }
          </Select>
        </div>

      </div >

      <div>
        {/* the simple list view */}
        {
          listView && hasScores &&
          <Paper>
            <List>
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
                    {isLoaded ?
                      <CardMedia
                        className={classes.media}
                        image={isLoaded ? band.scores[index].parts[0].pages[0].originalURL : 'http://personalshopperjapan.com/wp-content/uploads/2017/03/130327musicscore-1024x768.jpg'}
                        title="default-image"
                        onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}
                      />
                      : this.onHandleFallback()
                    }

                    {/* If band props is not yet loaded, a progress bar is displayed */}
                    {isLoaded ?
                      <CardContent className={classes.ellipsis}>
                        <Typography variant='subheading' className={classes.metadata}
                          onClick={() => window.location.hash = `#/score/${band.id}${score.id}`}>
                          {score.composer == undefined ? '' : `${'Composer: ' + score.composer}`}
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
                      : <CircularProgress className={classes.progress} size={40} thickness={2} />}
                    {/* progress circle while waiting for the correct image to render */}
                  </div>

                  {band.bandtype ?
                    // If bandtype is not chosen yet, the expandion panel is hidden
                    <div onClick={this.onExpansionClick} id={index}>
                      <ExpansionPanel id={index}>
                        <ExpansionPanelSummary className={classes.expandButton} expandIcon={<ExpandMoreIcon id={index} />}
                          id={index} >
                          <Typography variant='subheading' className={classes.heading} id={index}>Toggle instruments</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails className={classes.expandedPanel}>
                          <Typography variant='subheading'>


                            {/* ORIGINIAL */}
                            {/* <List>
                              {
                                this.state.instruments.map((instruments, index) =>
                                  <ListItem key={index} className={classes.expandedListItems}> */}
                            {/* Checking for matching instruments in each scores,
                                   then displaying an error or music note icon based on the result  */}
                            {/* 
                                    {matchingInstruments.includes(instruments) ?
                                      <Tooltip title=''>
                                        <MusicNote color='action' />
                                      </Tooltip> :
                                      <Tooltip title='Instrument not found in this score' aria-label="error">
                                        <Error color='action' />
                                      </Tooltip>
                                    }

                                    <ListItemText primary={`${instruments}: `} />
                                    <List>
                                      <InstrumentScores
                                        vocalInstruments={this.state.vocalInstruments}
                                        instruments={instruments}
                                        test={test}
                                        band={this.props.band}
                                        matching={matchingInstruments}
                                      />
                                      {
                                        <ListItem>
                                        </ListItem>
                                      }
                                    </List>


                                  </ListItem>
                                )
                              }
                            </List> */}





                            {/* TESTING */}
                            <List>
                              {
                                Object.keys(this.state.vocalInstruments).map((key, index) =>
                                  <ListItem key={index} className={classes.expandedListItems}>
                                
                                    {
                                      <Tooltip title=''>
                                        <MusicNote color='action' />
                                      </Tooltip>
                                    }



                                    <ListItemText primary={`${key}: `} />
                                    <List>

                                      <ListItem key={index}>
                                        {this.state.vocalInstruments[key][0].map((item, index) =>
                                          < ListItemText key={index} className={classes.instrumentstyle} > {item} </ListItemText>
                                        )
                                        }
                                        
                                      </ListItem>
                                    </List>



                                  </ListItem>
                                )
                              }
                            </List>


















                          </Typography>
                        </ExpansionPanelDetails>
                      </ExpansionPanel>
                    </div>
                    : ""}
                  {/* Displaying an empty expansion panel */}
                </Card>
              )}
          </div>
        }
      </div>
    </div >
  }




}

export default withStyles(styles)(Scores);