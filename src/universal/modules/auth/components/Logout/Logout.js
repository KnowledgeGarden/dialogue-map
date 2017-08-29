import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {logoutAndRedirect} from '../../ducks/auth';

@connect()
export default class Logout extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired
  };

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch(logoutAndRedirect());
  }

  render() {
    return <p>Successfully logged out</p>;
  }
}
