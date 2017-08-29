import makeReducer from 'universal/redux/makeReducer';
import {resolvePromiseMap} from 'universal/utils/promises';
import AppContainer from 'universal/modules/app/containers/App/AppContainer';
import {setAppBar} from 'universal/modules/app/ducks/app';

// see https://github.com/reactjs/react-router/blob/master/docs/API.md
export default function (store) {
  const {dispatch} = store;
  const title = () => dispatch(setAppBar({title: 'All Maps'}));
  return {
    path: 'maps',
    component: AppContainer,
    onEnter: title,
    onChange: title,
    getIndexRoute: async (location, cb) => {
      const promiseMap = setMapsImports();
      const importMap = await resolvePromiseMap(promiseMap);
      const {component, optimistic, ...asyncReducers} = getMapsImports(importMap);
      const newReducer = makeReducer(asyncReducers, optimistic);
      store.replaceReducer(newReducer);
      cb(null, {component});
    },
    childRoutes: [
      require('./map')(store)
    ]
  };
}

function setMapsImports() {
  return new Map([
    ['component', System.import('universal/modules/maps/containers/Maps/MapsContainer')],
    ['optimistic', System.import('redux-optimistic-ui')],
    ['maps', System.import('universal/modules/maps/ducks/maps')],
    ['socket', System.import('redux-socket-cluster')]
  ]);
}

function getMapsImports(importMap) {
  return {
    component: importMap.get('component'),
    optimistic: importMap.get('optimistic').optimistic,
    maps: importMap.get('maps').reducer,
    socket: importMap.get('socket').socketClusterReducer
  };
}
