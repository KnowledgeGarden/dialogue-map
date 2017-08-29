import makeReducer from 'universal/redux/makeReducer';
import {resolvePromiseMap} from 'universal/utils/promises';
import {setAppBar} from 'universal/modules/app/ducks/app';

export default function (store) {
  return {
    path: ':mapId(/:view)',
    onEnter: (nextState, replace) => {
      const {dispatch} = store;
      if (!nextState.params.view) replace({pathname: `/maps/${nextState.params.mapId}/tree`});
      dispatch(setAppBar({title: title(nextState.params.view)}));
    },
    getIndexRoute: async (location, cb) => {
      const promiseMap = setMapImports();
      const importMap = await resolvePromiseMap(promiseMap);
      const {component, optimistic, ...asyncReducers} = getMapImports(importMap);
      const newReducer = makeReducer(asyncReducers, optimistic);
      store.replaceReducer(newReducer);
      cb(null, {component});
    }
  };
}

function setMapImports() {
  return new Map([
    ['component', System.import('universal/modules/map/containers/Map/MapContainer')],
    ['optimistic', System.import('redux-optimistic-ui')],
    ['nodes', System.import('universal/modules/map/ducks/nodes')],
    ['socket', System.import('redux-socket-cluster')]
  ]);
}

function getMapImports(importMap) {
  return {
    component: importMap.get('component'),
    optimistic: importMap.get('optimistic').optimistic,
    nodes: importMap.get('nodes').reducer,
    socket: importMap.get('socket').socketClusterReducer
  };
}

function title(view) {
  switch (view) {
    case 'tree': return 'Map Tree';
    case 'stream': return 'Map Stream';
    default: return null;
  }
}
