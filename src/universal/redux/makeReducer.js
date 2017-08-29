import {reducer as form} from 'redux-form';
import {routeReducer as routing} from 'redux-simple-router';
import {compose} from 'redux';
import {combineReducers} from 'redux-immutablejs';
import app from '../modules/app/ducks/app';
import auth from '../modules/auth/ducks/auth';

const currentReducers = {
  app,
  auth,
  routing,
  form
};

export default (newReducers, reducerEnhancers) => {
  Object.assign(currentReducers, newReducers);
  const reducer = combineReducers({...currentReducers});
  if (reducerEnhancers) {
    return Array.isArray(reducerEnhancers) ? compose(...reducerEnhancers)(reducer) : reducerEnhancers(reducer);
  }
  return reducer;
};
