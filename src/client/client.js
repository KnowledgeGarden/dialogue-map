import {render} from 'react-dom';
import React from 'react';
import {Map as iMap, fromJS} from 'immutable';

const makeStore = __PRODUCTION__ ? require('./makeStore.prod') : require('./makeStore.dev');
const Root = __PRODUCTION__ ? require('./Root.prod') : require('./Root.dev');
const {auth, routing, form} = window.__INITIAL_STATE__;

 /* Currently, 3rd party reducers are kept as plain JS objects (routing and form)
 Although confusing, I'm calling this a best practice because not every reducer
 will be written well enough to handle being transformed into an immutable*/
const initialState = iMap([
  ['auth', fromJS(auth)],
  ['routing', routing],
  ['form', form]
]);

const store = makeStore(initialState);
render(<Root store={store}/>, document.getElementById('root'));
