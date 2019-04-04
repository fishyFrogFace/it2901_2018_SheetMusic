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
    padding: '10px',
  },
  formControlDisabled: {
    display: 'none'
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
          <InputLabel className={classes.label} htmlFor="ensemble-simple"></InputLabel>

          <Select
            autoWidth
            value={this.props.bandtype}
            onChange={this.props.onChange}
            inputProps={{
              name: 'bandtype'
            }}
            className={classes.selecter}
            renderValue={() => this.props.bandtype}
          >
            {/* map over the arrangment and instrument options declared in state in Scores.js */}
            {
              this.props.bandtypes.map((data, key) =>
                <MenuItem key={key} value={data.name}>{data.name}
                </MenuItem>
              )}
          </Select>
        </FormControl>
      </form>

    </div>
  }
}

export default withStyles(styles)(SelectArrangements);