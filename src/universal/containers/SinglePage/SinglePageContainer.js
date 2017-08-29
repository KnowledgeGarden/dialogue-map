import React, {PropTypes, Component} from 'react';
import injectTapeEventPlugin from 'react-tap-event-plugin';
import {connect} from 'react-redux';
import {ensureState} from 'redux-optimistic-ui';

import socketOptions from 'universal/utils/socketOptions';
import loginWithToken from '../../decorators/loginWithToken/loginWithToken';
import Page from '../../components/Page/Page';

injectTapeEventPlugin();
@connect(mapStateToProps)
@loginWithToken(socketOptions.authTokenName)
export default class SinglePageContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    isAuthenticated: PropTypes.bool.isRequired
  };

  render() {
    return <Page {...this.props}/>;
  }
}

function mapStateToProps(state) {
  return {
    isAuthenticated: ensureState(state).getIn(['auth', 'isAuthenticated'])
  };
}
