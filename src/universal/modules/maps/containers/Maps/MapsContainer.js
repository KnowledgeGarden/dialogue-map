import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MapsComponent from 'universal/modules/maps/components/Maps/MapsComponent';
import {reduxSocket} from 'redux-socket-cluster';
import socketOptions from 'universal/utils/socketOptions';
import {loadMaps, mapActions} from 'universal/modules/maps/ducks/maps';
import {ensureState} from 'redux-optimistic-ui';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

let subd = false;

@connect(mapStateToProps, mapDispatchToProps)
@requireAuth
@reduxSocket(socketOptions)
export default class MapsContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    mapActions: PropTypes.object.isRequired,
    maps: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    const {dispatch} = props;
    if (subd === false) {
      dispatch(loadMaps());
      subd = true;
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.ready;
  }

  render() {
    return <MapsComponent addMap={this.props.mapActions.addMap} {...this.props}/>;
  }
}

function mapStateToProps(state) {
  state = ensureState(state);
  const auth = state.get('auth');
  return {
    ready: Boolean(state.getIn(['maps', 'loaded'])),
    maps: {...state.get('maps').toJS(), data: state.getIn(['maps', 'data']).toList().toJS()},
    userId: auth.getIn(['user', 'id']),
    socketState: state.getIn(['socket', 'socketState']),
    isAuthenticated: Boolean(auth.get('isAuthenticated')),
    hasAuthError: Boolean(auth.get('error').size)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    mapActions: bindActionCreators({...mapActions}, dispatch),
    dispatch
  };
}
