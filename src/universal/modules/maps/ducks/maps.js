import {fromJS, Map as iMap} from 'immutable';
import socketCluster from 'socketcluster-client';
import socketOptions from '../../../utils/socketOptions';
import {prepareGraphQLParams} from '../../../utils/fetching';

/*
 * Action types
 */
export const MAPS = 'maps'; // db table
export const ADD_MAP = 'ADD_MAP';
export const UPDATE_MAP = 'UPDATE_MAP';
export const DELETE_MAP = 'DELETE_MAP';
const LOADED_MAPS = 'LOADED_MAPS'; // track subscription state
const CLEAR_MAPS = 'CLEAR_MAPS'; // local state flush
const ADD_MAP_SUCCESS = 'ADD_MAP_SUCCESS';
const UPDATE_MAP_SUCCESS = 'UPDATE_MAP_SUCCESS';
const DELETE_MAP_SUCCESS = 'DELETE_MAP_SUCCESS';
const ADD_MAP_ERROR = 'ADD_MAP_ERROR';
const UPDATE_MAP_ERROR = 'UPDATE_MAP_ERROR';
const DELETE_MAP_ERROR = 'DELETE_MAP_ERROR';


/*
 * Reducer
 * For tables, I always keep these 4 fields.
 * If loaded is false, then the inifial fetch from the db is not complete
 * If synced is false, it means what you see is optimistic, not from the db
 * If there is an error, then you can use that in the UI somewhere
 */
const initialState = iMap({
  loaded: false,
  synced: false,
  error: null,
  data: iMap()
});

export function reducer(state = initialState, action) {
  let doc;
  switch (action.type) {
    case ADD_MAP:
      ({doc} = action.payload.variables);
      doc.createdAt = normalizeDate(doc.createdAt);
      doc.updatedAt = normalizeDate(doc.updatedAt);
      return state.merge({
        synced: action.meta && action.meta.synced || false,
        data: state.get('data').has(doc.id) ? state.get('data') : state.get('data').set(doc.id, fromJS(doc))
      });
    case UPDATE_MAP:
      ({doc} = action.payload.variables);
      return state.merge({
        synced: action.meta && action.meta.synced || false,
        data: state.get('data').set(doc.id, state.get('data').get(doc.id).merge(fromJS(doc)))
      });

    case DELETE_MAP:
      return state.merge({
        synced: action.meta && action.meta.synced || false,
        data: state.get('data').delete(action.payload.variables.id)
      });
    case LOADED_MAPS:
      return state.merge({
        loaded: true
      });
    case CLEAR_MAPS:
      return initialState;

    case ADD_MAP_SUCCESS:
    case UPDATE_MAP_SUCCESS:
    case DELETE_MAP_SUCCESS:
      return state.merge({
        synced: true,
        error: null
      });

    case ADD_MAP_ERROR:
    case UPDATE_MAP_ERROR:
    case DELETE_MAP_ERROR:
      return state.merge({
        synced: true,
        error: action.error || 'Error'
      });

    default:
      return state;
  }
}

/*
 * Action creators
 * Actions are pure JS objects, save the immutable stuff for the store
 */
const baseMeta = {
  table: MAPS,
  isOptimistic: true,
  synced: false,
  isChild: false
};

export function loadMaps() {
  const query = `
  subscription {
    getAllMaps {
      id,
      userId,
      title,
      createdAt,
      updatedAt
    }
  }`;
  const serializedParams = prepareGraphQLParams({query});
  const sub = 'getAllMaps';
  const subDone = `${sub}Done`;
  const socket = socketCluster.connect(socketOptions);
  socket.subscribe(serializedParams, {waitForAuth: true});
  return dispatch => {
    // client-side changefeed handler
    socket.on(sub, data => {
      const meta = {synced: true};
      if (data.new_val && !data.old_val) {
        dispatch(addMap(data.new_val, meta));
      } else if (data.old_val && !data.new_val) {
        dispatch(deleteMap(data.old_val.id, meta));
      } else {
        dispatch(updateMap(data.new_val, meta));
      }
    });
    socket.on(subDone, () => {
      dispatch({type: LOADED_MAPS});
    });
    socket.on('unsubscribe', channelName => {
      if (channelName === sub) {
        dispatch({type: CLEAR_MAPS});
      }
    });
  };
}

export function addMap(doc, meta) {
  const query = `
  mutation($doc: NewMap!){
     payload: addMap(map: $doc) {
      id
    }
  }`;
  return {
    type: ADD_MAP,
    payload: {
      query,
      variables: {doc}
    },
    meta: Object.assign({}, baseMeta, meta)
  };
}

export function updateMap(doc, meta) {
  const query = `
  mutation($doc: UpdatedMap!){
     payload: updateMap(map: $doc) {
      id
    }
  }`;
  return {
    type: UPDATE_MAP,
    payload: {
      query,
      variables: {doc}
    },
    meta: Object.assign({}, baseMeta, meta)
  };
}

export function deleteMap(id, meta) {
  const query = `
  mutation($id: ID!) {
     payload: deleteMap(id: $id)
  }`;
  return {
    type: DELETE_MAP,
    payload: {
      query,
      variables: {id}
    },
    meta: Object.assign({}, baseMeta, meta)
  };
}

export const mapActions = {
  addMap,
  updateMap,
  deleteMap
};

function normalizeDate(val) {
  return val ? Number(new Date(val)) : Number(new Date());
}
