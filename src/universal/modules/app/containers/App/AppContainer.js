import React, {PropTypes, Component} from 'react';
import App from 'universal/modules/app/components/App/App';
import {connect} from 'react-redux';
import {ensureState} from 'redux-optimistic-ui';

@connect(mapStateToProps)
export default class AppContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    isAuthenticated: PropTypes.bool.isRequired
  };

  render() {
    return <App {...this.props}/>;
  }
}

function mapStateToProps(state) {
  state = ensureState(state);
  return {
    appBar: state.getIn(['app', 'bar']).toJS(),
    menuIsOpen: state.getIn(['app', 'menu', 'open']),
    profile: state.getIn(['app', 'profile']).toJS(),
    user: state.getIn(['auth', 'user']).toJS(),
    isAuthenticated: state.getIn(['auth', 'isAuthenticated']),
    isAdministrator: state.hasIn(['auth', 'user', 'role', 'ADMINISTRATOR'])
  };
}
