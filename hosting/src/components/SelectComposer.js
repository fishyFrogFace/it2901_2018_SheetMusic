import React from 'react';
import { InputLabel, Select, MenuItem, FormControl } from "material-ui";
import { withStyles } from "material-ui/styles";

const styles = {
  label: {
    display: 'contents',
  },
  selector: {
    display: 'contents',
  },
  content: {
    display: 'flex',
    justifyContent: 'space-evenly',
  }
};

class SelectComposer extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { classes } = this.props;
    return <div className={classes.content}>


        <FormControl className={classes.formControl}>
          <InputLabel className={classes.label} htmlFor="composer">Composer</InputLabel>
          <Select
              value = "Composer"
              onChange = {this.props.onChange}
              name="Composer"
              inputProps={{
                  name: 'composer',
                  id: 'composer',
              }}
          >

            {/* map over the arrangement and instrument options declared in state in Scores.js */}
            {this.props.optionsdata.map((data, key) =>
              <MenuItem key={key} value={data.key}>{data.value}</MenuItem>
            )}
          </Select>
        </FormControl>
    </div>
  }
}

export default withStyles(styles)(SelectComposer);