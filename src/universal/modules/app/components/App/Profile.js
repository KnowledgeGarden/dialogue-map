import React, {PropTypes, Component} from 'react';
import Popover from 'material-ui/Popover';
import {Card, CardActions, CardHeader} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import {Link} from 'react-router';
import {closeProfile} from '../../ducks/app.js';

export default class Profile extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired
    }).isRequired,
    profile: PropTypes.shape({
      open: PropTypes.bool.isRequired,
      target: PropTypes.element
    }).isRequired
  };

  render() {
    const {profile: {open, target}, user: {id, name, handle, email}} = this.props;
    return (
      <Popover
        open={open}
        anchorEl={target}
        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        onRequestClose={this.handleCloseProfile}
      >
        <Card>
          <CardHeader
            title={name || handle || id}
            subtitle={email || ''}
            avatar={`http://lorempixel.com/300/300/nature/${handle}/`}
          />
          <CardActions>
            <Link onTouchTap={this.handleCloseProfile} to="/logout">
              <FlatButton label="Logout"/>
            </Link>
          </CardActions>
        </Card>
      </Popover>
    );
  }

  handleCloseProfile = () => {
    const {dispatch} = this.props;
    dispatch(closeProfile);
  }
}
