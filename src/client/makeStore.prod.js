import {browserHistory} from 'react-router';

import {createStore, applyMiddleware} from 'redux';
import {syncHistory} from 'redux-simple-router';
import thunkMiddleware from 'redux-thunk';

import makeReducer from '../universal/redux/makeReducer';
import optimisticMiddleware from '../universal/redux/middleware/optimisticMiddleware';

export default function (initialState) {
  const reduxRouterMiddleware = syncHistory(browserHistory);
  const createStoreWithMiddleware = applyMiddleware(reduxRouterMiddleware, optimisticMiddleware, thunkMiddleware)(createStore);
  return createStoreWithMiddleware(makeReducer(), initialState);
}
