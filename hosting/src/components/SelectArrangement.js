import React from 'react';
import { InputLabel, Select, MenuItem, FormControl } from "material-ui";
import { withStyles } from "material-ui/styles";

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
  }

  render() {
    const { classes } = this.props;
    return <div className={classes.content}>

      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.label} htmlFor="ensemble-simple">Ensemble</InputLabel>
          <Select
            autoWidth
            value={this.props.activeInstrument}
            onChange={this.props.onChange}
            inputProps={{
              name: 'ensemble',
              id: 'ensemble-simple',
            }}
            className={classes.selecter}
            renderValue={() => this.props.activeInstrument} // the displayed alternative in the select box
          >
            {/* map over the arrangment and instrument options declared in state in Scores.js */}
            {this.props.optionsdata.map((data, key) =>
              <MenuItem key={key} value={data.key}>{data.value}</MenuItem>
            )}
          </Select>
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