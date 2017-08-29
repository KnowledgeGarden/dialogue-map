import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MapComponent from 'universal/modules/map/components/Map/MapComponent';
import {reduxSocket} from 'redux-socket-cluster';
import socketOptions from 'universal/utils/socketOptions';
import {loadNodes, nodeActions} from 'universal/modules/map/ducks/nodes';
import {ensureState} from 'redux-optimistic-ui';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

const subs = {};

@connect(mapStateToProps, mapDispatchToProps)
@requireAuth
@reduxSocket(socketOptions)
export default class MapContainer extends Component {
  static propTypes = {
    params: PropTypes.shape({
      mapId: PropTypes.string.isRequired,
      view: PropTypes.string.isRequired
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
    nodeActions: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    userId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    const {dispatch, mapId} = props;
    if (!subs[mapId]) {
      dispatch(loadNodes(mapId));
      subs[mapId] = true;
    }
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.ready;
  }

  render() {
    return <MapComponent {...this.props}/>;
  }
}

function mapStateToProps(state, ownProps) {
  state = ensureState(state);
  const auth = state.get('auth');
  const thisMap = node => node.mapId === ownProps.params.mapId;
  return {
    ready: Boolean(state.getIn(['nodes', 'loaded', ownProps.params.mapId])),
    data: state.getIn(['nodes', 'data']).toList().toJS().filter(thisMap),
    nodes: state.get('nodes'),
    view: ownProps.params.view,
    userId: auth.getIn(['user', 'id']),
    mapId: ownProps.params.mapId,
    socketState: state.getIn(['socket', 'socketState']),
    isAuthenticated: Boolean(auth.get('isAuthenticated')),
    hasAuthError: Boolean(auth.get('error').size)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    nodeActions: bindActionCreators({...nodeActions}, dispatch),
    dispatch
  };
}
