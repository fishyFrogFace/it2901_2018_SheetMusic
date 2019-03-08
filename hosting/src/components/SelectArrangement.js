import React from 'react';
import { List, ListItem, ListItemText, Input, InputLabel, Select, MenuItem, FormControl } from "material-ui";
import { LibraryMusic, SortByAlpha, ViewList, ViewModule } from "material-ui-icons";
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
  handleChangeEnsemble = (event) => {
    const tempValue = event.target.value
    this.props.selecter(tempValue)
    this.setState({ tempID: event.target.value });
  };

  // handleChangeVocal = event => {
  //   this.setState({ [event.target.name]: event.target.value });
  // };

  renderValue = (value) => {
    return (
      <div>
        {value[0]}
      </div>
    )
  }

  render() {
    const { classes } = this.props;
    return <div className={classes.content}>
      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formControl}>
          <InputLabel className={classes.label} htmlFor="ensemble-simple">Ensemble</InputLabel>
          <Select
            autoWidth
            value={this.props.ensemble}
            onChange={this.handleChangeEnsemble}
            inputProps={{
              name: 'ensemble',
              id: 'ensemble-simple',
            }}
            className={classes.selecter}
            renderValue={() => this.renderValue(this.props.ensemble)}
          >
            <MenuItem value={this.props.allInstruments}>
              <em>Default</em>
            </MenuItem>
            <MenuItem value={this.props.jazz}>Jazz Band</MenuItem>
            <MenuItem value={this.props.chamberOrchestra}>Chamber Orchestra</MenuItem>
            <MenuItem value={this.props.symphonyOrchestra}>Symphony Orchestra</MenuItem>
          </Select>
        </FormControl>
      </form>


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