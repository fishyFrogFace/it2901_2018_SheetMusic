import React from 'react';
import { InputLabel, Select, MenuItem, FormControl } from "material-ui";
import { withStyles } from "material-ui/styles";
import firebase from 'firebase';
const styles = {
  label: {
    display: 'contents',
  },
  selecter: {
    display: 'contents',
  },
  content: {
    display: 'flex',
    justifyContent: 'space-evenly',
  }
}

class SelectArrangements extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      bandtype: 'Select.. ',
      selected: false,
    }
  }

  _onSelectChange = event => {
    this.setState({ bandtype: event.target.value, selected: true });

    const bandRef = firebase.firestore().doc(`bands/${this.props.band.id}`);
    const bandtypeRef = firebase.firestore().collection('bandtype');

  };

  componenDidUpdate = () => {
    const ensemble = ''
    const bandtypeRef = firebase.firestore().collection('bandtype');

    this.setState({
      bandtype: this.props.band.bandtype
    })
  }

  render() {
    const { classes } = this.props;
    const isThisIndex = this.props.index;
    const isThisActiveName = this.props.activeName;


    return <div className={classes.content}>



      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.label} htmlFor="ensemble-simple">Ensemble</InputLabel>


          <Select
            autoWidth
            value={this.state.bandtype}
            onChange={this._onSelectChange}
            inputProps={{
              name: 'bandtype'
            }}
            className={classes.selecter}
            renderValue={() => this.state.selected ? this.props.band.bandtype : this.state.bandtype} // the displayed alternative in the select box

          >
            {/* map over the arrangment and instrument options declared in state in Scores.js */}

            {
              this.props.bandtypes.map((data, key) =>
                <MenuItem key={key} value={data.name}>{data.name}
                </MenuItem>
              )}
          </Select>
          {/* {"" + isThisIndex !== isThisActiveName &&
            <Select

              autoWidth
              value={'default'}
              onChange={this.props.onChange}
              inputProps={{
                name: "" + this.props.index,
              }}
              className={classes.selecter}
              renderValue={() => this.props.optionsdata[0].value} // the displayed alternative in the select box
            >
              {/* map over the arrangment and instrument options declared in state in Scores.js */}
          {/* {
                this.props.optionsdata.map((data, key) =>
                  <MenuItem key={key} value={data.key}>{data.value}
                  </MenuItem>
                )} */}
          {/* </Select>} */}
        </FormControl>
      </form>

      {/* TODO: add functionality to the vocal select box */}
      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.label} htmlFor="vocal-simple">Vocal</InputLabel>
          <Select
            autoWidth
            value={100}
            onChange={this.handleChangeVocal}
            inputProps={{
              name: 'vocal',
              id: 'vocal-simple',
            }}
            className={classes.selecter}
          >
            <MenuItem value={1}>Yes</MenuItem>
            <MenuItem value={2}>No</MenuItem>
          </Select>
        </FormControl>
      </form>
    </div>
  }
}

export default withStyles(styles)(SelectArrangements);