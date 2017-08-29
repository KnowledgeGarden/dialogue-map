import makeReducer from 'universal/redux/makeReducer';
import {resolvePromiseMap} from 'universal/utils/promises';
import AppContainer from 'universal/modules/app/containers/App/AppContainer';
import {setAppBar} from 'universal/modules/app/ducks/app';

// see https://github.com/reactjs/react-router/blob/master/docs/API.md
export default function (store) {
  const {dispatch} = store;
  const title = () => dispatch(setAppBar({title: 'Blog', route: '/blog/post', permission: 'ADMINISTRATOR'}));
  return {
    path: 'blog',
    component: AppContainer,
    onEnter: title,
    onChange: title,
    getIndexRoute: async (location, cb) => {
      const promiseMap = setBlogImports();
      const importMap = await resolvePromiseMap(promiseMap);
      const {component, optimistic, ...asyncReducers} = getBlogImports(importMap);
      const newReducer = makeReducer(asyncReducers, optimistic);
      store.replaceReducer(newReducer);
      cb(null, {component});
    },
    childRoutes: [
      require('./post')(store)
    ]
  };
}

function setBlogImports() {
  return new Map([
    ['component', System.import('universal/modules/blog/containers/BlogContainer')],
    ['optimistic', System.import('redux-optimistic-ui')],
    ['posts', System.import('universal/modules/blog/ducks/posts')],
    ['socket', System.import('redux-socket-cluster')]
  ]);
}

function getBlogImports(importMap) {
  return {
    component: importMap.get('component'),
    optimistic: importMap.get('optimistic').optimistic,
    posts: importMap.get('posts').reducer,
    socket: importMap.get('socket').socketClusterReducer
  };
}
