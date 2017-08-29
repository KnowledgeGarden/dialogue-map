import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {reduxForm} from 'redux-form';
import Joi from 'joi';
import {parsedJoiErrors} from 'universal/utils/schema';
import {reduxSocket} from 'redux-socket-cluster';
import {ensureState} from 'redux-optimistic-ui';
import {getFormState} from 'universal/redux/helpers';
import socketOptions from 'universal/utils/socketOptions';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';
import PostForm from '../components/PostForm';
import {postSchemaInsert} from '../schemas/post';
import {postActions} from '../ducks/posts';

@connect(mapStateToProps, mapDispatchToProps)
@reduxForm({form: 'blogPostForm', fields: ['title', 'details'], validate, getFormState})
@requireAuth
@reduxSocket(socketOptions)
export default class PostContainer extends Component {
  render() {
    return <PostForm {...this.props}/>;
  }
}

function mapStateToProps(state, ownProps) {
  state = ensureState(state);
  return {
    postError: state.getIn(['posts', 'error']),
    post: state.getIn(['posts', 'data', ownProps.postId]),
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

function validate(values) {
  const results = Joi.validate(values, postSchemaInsert, {abortEarly: false});
  return parsedJoiErrors(results.error);
}
