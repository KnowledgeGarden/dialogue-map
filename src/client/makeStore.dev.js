import {browserHistory} from 'react-router';

import {createStore, applyMiddleware, compose} from 'redux';
import createLogger from 'redux-logger';
import {ensureState} from 'redux-optimistic-ui';
import {syncHistory} from 'redux-simple-router';
import thunkMiddleware from 'redux-thunk';

import makeReducer from '../universal/redux/makeReducer';
import optimisticMiddleware from '../universal/redux/middleware/optimisticMiddleware';

import DevTools from './DevTools';

const loggerMiddleware = createLogger({
  level: 'info',
  collapsed: true
});

export default function (initialState) {
  const reduxRouterMiddleware = syncHistory(browserHistory);
  const createStoreWithMiddleware = compose(applyMiddleware(reduxRouterMiddleware, optimisticMiddleware, thunkMiddleware, loggerMiddleware),
    DevTools.instrument())(createStore);
  const store = createStoreWithMiddleware(makeReducer(), initialState);
  reduxRouterMiddleware.listenForReplays(store, state => ensureState(state).get('routing'));
  return store;
}
