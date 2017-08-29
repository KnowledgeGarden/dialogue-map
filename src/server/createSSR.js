import fs from 'fs';
import {join, basename} from 'path';

import promisify from 'es6-promisify';
import {Map as iMap} from 'immutable';

import React from 'react';
import {renderToStaticMarkup} from 'react-dom-stream/server';
import {match} from 'react-router';

import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {UPDATE_LOCATION} from 'redux-simple-router';

import makeReducer from '../universal/redux/makeReducer';
import Html from './Html.js';

// https://github.com/systemjs/systemjs/issues/953

function renderPage(res, store, assets, renderProps) {
  const location = renderProps ? renderProps.location : '/';
  // Needed so some components can render based on location
  store.dispatch({type: UPDATE_LOCATION, location});
  const htmlStream = renderToStaticMarkup(
    <Html title="Dialogue Map" store={store} assets={assets} renderProps={renderProps}/>
  );
  res.write('<!DOCTYPE html>');
  htmlStream.pipe(res, {end: false});
  htmlStream.on('end', () => res.end());
}

export default async function createSSR(req, res) {
  const finalCreateStore = applyMiddleware(thunkMiddleware)(createStore);
  const store = finalCreateStore(makeReducer(), iMap());
  if (process.env.NODE_ENV === 'production') {
    const makeRoutes = require('../../build/prerender');
    const assets = require('../../build/assets.json');
    const readFile = promisify(fs.readFile);
    assets.manifest.text = await readFile(join(__dirname, '..', '..', 'build', basename(assets.manifest.js)), 'utf-8');
    const routes = makeRoutes(store);
    match({routes, location: req.url}, (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send(error.message);
      } else if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (renderProps) {
        // just look away, this is ugly & wrong https://github.com/callemall/material-ui/pull/2172
        GLOBAL.navigator = {userAgent: req.headers['user-agent']};
        renderPage(res, store, assets, renderProps);
      } else {
        res.status(404).send('Not found');
      }
    });
  } else {
    // just send a cheap html doc + stringified store
    renderPage(res, store);
  }
}

