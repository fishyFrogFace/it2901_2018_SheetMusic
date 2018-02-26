import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import MenuIcon from 'material-ui-icons/Menu';
import Divider from 'material-ui/Divider';
import GroupIcon from 'material-ui-icons/Group';
import DraftsIcon from 'material-ui-icons/Drafts';
import AccountCircleIcon from 'material-ui-icons/AccountCircle';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import {
  Drawer, List, IconButton
} from 'material-ui';
import Button from 'material-ui/Button'

const styles = theme => ({
  root: {
    width: 300,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  signout: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  input: {
    display: 'none',
  },
  joincreate: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonSignout: {
    color: 'white',
    backgroundColor: 'rgb(255, 0, 80)',
    "&:hover": {
      backgroundColor: 'rgb(230, 0, 80)',
    },
  },
});

function SimpleList(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <List className={classes.profile}>
        <ListItem>
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary='Profile name' />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem>
          <ListItemIcon>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary='Bands' />
        </ListItem>
      </List>
      <Divider />
      <List className={classes.joincreate}>
        <Button variant='raised' color='default' className={classes.button}>
          Join band
        </Button>
        <Button variant='raised' color='default' className={classes.button}>
          Create band
        </Button>
      </List>
      <Divider />
      <List className={classes.signout}>
        <Button variant='raised' color='default' className={classes.buttonSignout}>
          Sign out
        </Button>
      </List>
    </div>
  );
}

SimpleList.propTypes = {
  classes: PropTypes.object.isRequired,
};

class TemporaryDrawer extends React.Component {
  state = {
    left: false
  };

  toggleDrawer = (side, open) => () => {
    this.setState({
      [side]: open,
    });
  };

  render() {
    const { classes } = this.props;

    const sideList = SimpleList(this.props);

    return (
      <div>
      <IconButton color='default' onClick={this.toggleDrawer('left', true)}>
          <MenuIcon style={{color: 'white'}}/>
      </IconButton>
        <Drawer open={this.state.left} onClose={this.toggleDrawer('left', false)}>
          <div
            tabIndex={0}
            role='button'
            onClick={this.toggleDrawer('left', false)}
            onKeyDown={this.toggleDrawer('left', false)}
          >
            {sideList}
          </div>
        </Drawer>
      </div>
    );
  }
}

TemporaryDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TemporaryDrawer);
