import {fromJS, Map as iMap} from 'immutable';
// import uuid from 'node-uuid';
import {fetchGraphQL} from '../../../utils/fetching';
import {routeActions} from 'redux-simple-router';

const {push} = routeActions;

/*
 * Action types
 */
export const LOAD_POSTS = 'LOAD_POSTS';
export const LOAD_POSTS_SUCCESS = 'LOAD_POSTS_SUCCESS';
export const LOAD_POSTS_ERROR = 'LOAD_POSTS_ERROR';
export const CREATE_POST = 'CREATE_POST';
export const CREATE_POST_SUCCESS = 'CREATE_POST_SUCCESS';
export const CREATE_POST_ERROR = 'CREATE_POST_ERROR';

/*
 * Reducer
 * If synced is false, it means what you see is optimistic, not from the db
 */
const initialState = iMap({
  synced: false,
  error: null,
  data: iMap()
});

export function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_POSTS:
    case CREATE_POST:
      return state.merge({
        synced: false
      });

    case LOAD_POSTS_SUCCESS:
      return state.merge({
        synced: true,
        data: fromJS(action.payload).sort(creationOrder),
        error: null
      });

    case CREATE_POST_SUCCESS:
      return state.merge({
        synced: true,
        data: state.get('data').set(action.payload.id, fromJS(action.payload)).sort(creationOrder),
        error: null
      });

    case LOAD_POSTS_ERROR:
    case CREATE_POST_ERROR:
      return state.merge({
        synced: true,
        error: action.error || 'Error'
      });

    default:
      return state;
  }
}

export const loadPosts = dispatch => {
  dispatch({type: LOAD_POSTS});
  return new Promise(async (resolve, reject) => {
    const query = `
    query {
       payload: getAllPosts {
        id,
        title,
        details,
        handle,
        createdAt,
        updatedAt
      }
    }`;
    const {error, data} = await fetchGraphQL({query});
    if (error) {
      dispatch(loadPostsError(error));
      reject(error);
    } else {
      const {payload} = data;
      dispatch(loadPostsSuccess(payload));
      resolve();
    }
  });
};

export function loadPostsError(error) {
  return {
    type: LOAD_POSTS_ERROR,
    error
  };
}

export function loadPostsSuccess(payload) {
  return {
    type: LOAD_POSTS_SUCCESS,
    payload
  };
}

export const createPost = (dispatch, doc, redirect) => {
  dispatch({type: CREATE_POST});
  return new Promise(async (resolve, reject) => {
    const query = `
    mutation($doc: NewPost!){
       payload: createPost(post: $doc) {
        id,
        title,
        details,
        handle,
        createdAt,
        updatedAt
      }
    }`;
    const {error, data} = await fetchGraphQL({query, variables: {doc}});
    if (error) {
      dispatch(createPostError(error));
      reject(error);
    } else {
      const {payload} = data;
      dispatch(createPostSuccess(payload));
      dispatch(push(redirect));
      resolve();
    }
  });
};

export function createPostError(error) {
  return {
    type: CREATE_POST_ERROR,
    error
  };
}

export function createPostSuccess(payload) {
  return {
    type: CREATE_POST_SUCCESS,
    payload
  };
}

function creationOrder(a, b) {
  if (a.createdAt === b.createdAt) return 0;
  return (a.createdAt > b.createdAt ? -1 : 1);
}
