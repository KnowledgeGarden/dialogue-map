import {fromJS, Map as iMap} from 'immutable';
import socketCluster from 'socketcluster-client';
import socketOptions from '../../../utils/socketOptions';
import {prepareGraphQLParams} from '../../../utils/fetching';

/*
 * Action types
 */
export const NODES = 'nodes'; // db table
export const NODE = 'node'; // dnd
export const ADD_NODE = 'ADD_NODE';
export const UPDATE_NODE = 'UPDATE_NODE';
export const DELETE_NODE = 'DELETE_NODE';
const LOADED_NODES = 'LOADED_NODES'; // local state import
const CLEAR_NODES = 'CLEAR_NODES'; // local state flush
const ADD_NODE_SUCCESS = 'ADD_NODE_SUCCESS';
const UPDATE_NODE_SUCCESS = 'UPDATE_NODE_SUCCESS';
const DELETE_NODE_SUCCESS = 'DELETE_NODE_SUCCESS';
const ADD_NODE_ERROR = 'ADD_NODE_ERROR';
const UPDATE_NODE_ERROR = 'UPDATE_NODE_ERROR';
const DELETE_NODE_ERROR = 'DELETE_NODE_ERROR';


/*
 * Reducer
 */
const initialState = iMap({
  loaded: iMap(),
  synced: false,
  error: null,
  data: iMap()
});

export function reducer(state = initialState, action) {
  let doc;
  let id;
  switch (action.type) {
    case ADD_NODE:
      ({doc} = action.payload.variables);
      doc = normalize(doc);
      return state.merge({
        synced: action.meta && action.meta.synced || false,
        data: state.get('data').set(doc.id, fromJS(doc))
      });
    case UPDATE_NODE:
      ({doc} = action.payload.variables);
      return state.merge({
        synced: action.meta && action.meta.synced || false,
        data: state.get('data').set(doc.id, state.get('data').get(doc.id).merge(fromJS(doc)))
      });
    case DELETE_NODE:
      ({id} = action.payload.variables);
      return state.merge({
        synced: action.meta && action.meta.synced || false,
        data: state.get('data').delete(id)
      });
    case LOADED_NODES:
      ({doc, id} = action.payload.variables);
      return state.merge({
        synced: true,
        loaded: state.get('loaded').set(id, true),
        data: state.get('data').merge(
          doc.map(doc => {
            return normalize(doc);
          }).reduce((state, doc) => {
            return state.set(doc.id, fromJS(doc));
          }, iMap())
        )
      });
    case CLEAR_NODES:
      ({id} = action.payload.variables);
      return initialState; // TODO: only clear nodes with this mapId;
    case ADD_NODE_SUCCESS:
    case UPDATE_NODE_SUCCESS:
    case DELETE_NODE_SUCCESS:
      return state.merge({
        synced: true,
        error: null
      });
    case ADD_NODE_ERROR:
    case UPDATE_NODE_ERROR:
    case DELETE_NODE_ERROR:
      return state.merge({
        synced: true,
        error: action.error || 'Error'
      });
    default:
      return state;
  }
}

/*
 *Action creators
 */
const baseMeta = {
  table: NODES,
  isOptimistic: true,
  synced: false
};

export function loadNodes(mapId) {
  const query = `
  subscription {
    getMapNodes(mapId: "${mapId}") {
      id,
      title,
      summary,
      details,
      responseType,
      parentId,
      mapId,
      userId,
      createdAt,
      updatedAt
    }
  }`;
  const serializedParams = prepareGraphQLParams({query});
  const sub = 'getMapNodes';
  const subDone = `${sub}Done`;
  const socket = socketCluster.connect(socketOptions);
  socket.subscribe(serializedParams, {waitForAuth: true});
  return dispatch => {
    // client-side changefeed handler
    let buffer = [];
    socket.on(sub, data => {
      const meta = {synced: true};
      if (!data.old_val) {
        if (data.new_val.mapId === mapId) {
          if (buffer) {
            buffer.push(data.new_val);
          } else {
            dispatch(addNode(data.new_val, meta));
          }
        }
      } else if (data.old_val && !data.new_val) {
        if (data.new_val.mapId === mapId) dispatch(deleteNode(data.old_val.id, meta));
      } else if (data.new_val.mapId === mapId) {
        dispatch(updateNode(data.new_val, meta));
      }
    });
    socket.on(subDone, data => {
      if (data && data.mapId === mapId && buffer) {
        dispatch(loadedNodes(buffer, mapId));
        buffer = null;
      }
    });
    socket.on('unsubscribe', channelName => {
      if (channelName === sub) {
        dispatch({type: CLEAR_NODES, payload: {variables: {id: mapId}}});
      }
    });
  };
}

export function loadedNodes(doc, id) {
  return {
    type: LOADED_NODES,
    payload: {
      variables: {doc, id}
    }
  };
}

export function addNode(doc, meta) {
  const query = `
  mutation($doc: NewNode!){
     payload: addNode(node: $doc) {
      id
    }
  }`;
  return {
    type: ADD_NODE,
    payload: {
      query,
      variables: {doc}
    },
    meta: Object.assign({}, baseMeta, meta)
  };
}

export function updateNode(doc, meta) {
  const query = `
  mutation($doc: UpdatedNode!){
     payload: updateNode(node: $doc) {
      id
    }
  }`;
  return {
    type: UPDATE_NODE,
    payload: {
      query,
      variables: {doc}
    },
    meta: Object.assign({}, baseMeta, meta)
  };
}

export function deleteNode(id, meta) {
  const query = `
  mutation($id: ID!) {
     payload: deleteNode(id: $id)
  }`;
  return {
    type: DELETE_NODE,
    payload: {
      query,
      variables: {id}
    },
    meta: Object.assign({}, baseMeta, meta)
  };
}

export function clearNodes() {
  return {
    type: DELETE_NODE
  };
}

export const nodeActions = {
  addNode,
  updateNode,
  deleteNode
};

function normalize(doc) {
  return {
    ...doc,
    createdAt: normalizeDate(doc.createdAt),
    updatedAt: normalizeDate(doc.updatedAt),
    responseType: normalizeResponseType(doc.responseType)
  };
}

function normalizeDate(val) {
  return val ? Number(new Date(val)) : Number(new Date());
}

function normalizeResponseType(val) {
  switch (val) {
    case 0: return 'QUESTION';
    case 1: return 'ANSWER';
    case 2: return 'PRO';
    case 3: return 'CON';
    default: return val;
  }
}
