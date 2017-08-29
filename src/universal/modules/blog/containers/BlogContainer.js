import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {reduxSocket} from 'redux-socket-cluster';
import {ensureState} from 'redux-optimistic-ui';
import socketOptions from 'universal/utils/socketOptions';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import Blog from '../components/Blog';
import Post from '../components/Post';
import {loadPosts, postActions} from '../ducks/posts';

@connect(mapStateToProps, mapDispatchToProps)
@requireAuth
@reduxSocket(socketOptions) // Ignore the console warnings. See https://github.com/facebook/react/pull/6268
export default class BlogContainer extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    postActions: PropTypes.object.isRequired,
    immutablePosts: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    loadPosts(props.dispatch);
  }

  render() {
    return (
      <Blog>
        {this.renderPosts()}
      </Blog>
    );
  }

  renderPosts() {
    return this.props.immutablePosts.entrySeq().map(([key, post]) => (
      <Post key={key} post={post.toJS()} {...this.props}/>
    ));
  }
}

function mapStateToProps(state) {
  state = ensureState(state);
  return {
    immutablePosts: state.getIn(['posts', 'data']),
    userId: state.getIn(['auth', 'user', 'id']),
    socketState: state.getIn(['socket', 'socketState']),
    isAuthenticated: Boolean(state.getIn(['auth', 'isAuthenticated'])),
    hasAuthError: Boolean(state.getIn(['auth', 'error']).size)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    postActions: bindActionCreators({...postActions}, dispatch),
    dispatch
  };
}
