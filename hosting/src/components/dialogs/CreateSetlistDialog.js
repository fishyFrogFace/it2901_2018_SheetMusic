import React from 'react';

import {TextField, withStyles} from "material-ui";
import {DatePicker} from "material-ui-pickers"

import AsyncDialog from "./AsyncDialog";
import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';

import grey from 'material-ui/colors/grey';

const styles = {
    input: {
        border: 0,
        outline: 0
    },
    date:{
        color:"black"
    }
};

const dateMaterialTheme = createMuiTheme({
    overrides: {
      MuiPickersToolbar: {
        toolbar: {
          backgroundColor: grey[400],
        },
      },
      MuiPickersCalendarHeader: {
        switchHeader: {
          // backgroundColor: lightBlue.A200,
          // color: 'white',
        },
      },
      MuiPickersDay: {
        day: {
          color: "black",
        },
        selected: {
          backgroundColor: grey['400'],
        },
        current: {
          color: grey['900'],
        },
      },
    },
  });
  

class CreateSetlistDialog extends React.Component {
    state = {
        title: '',
        date: new Date(),
    };

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined)
    }

    async open() {
        await this.dialog.open();
        return {title: this.state.title, date: this.state.date};
    }

    _onTitleInputChange = e => {
        this.setState({title: e.target.value});
    };

    _onDateChange = e => {
        this.setState({date: new Date(e.target.value)});
    };

    render() {
        const {classes} = this.props;
        const {title, date} = this.state;

        return <AsyncDialog title='Create Setlist' confirmText='Create' onRef={ref => this.dialog = ref}>
            <TextField label='Title' onChange={this._onTitleInputChange}/>
            <MuiThemeProvider theme={dateMaterialTheme}>
                <DatePicker
                    value={date}
                    onChange={date => {this.setState({date: date})} }
                />
            </MuiThemeProvider>
        </AsyncDialog>
    }
}

export default withStyles(styles)(CreateSetlistDialog);