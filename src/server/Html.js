import React, {Component, PropTypes} from 'react';
import {Provider} from 'react-redux';
import {RouterContext} from 'react-router';
import {renderToString} from 'react-dom-stream/server';

// Injects the server rendered state and app into a basic html template
export default class Html extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    title: PropTypes.string.isRequired,
    assets: PropTypes.object,
    renderProps: PropTypes.object
  };

  render() {
    const PROD = process.env.NODE_ENV === 'production';
    const {title, store, assets, renderProps} = this.props;
    const {manifest, app, vendor} = assets || {};
    const alloyBasepath = `window.CKEDITOR_BASEPATH = window.ALLOYEDITOR_BASEPATH = '/alloy-editor/'`;
    const alloyZConflict = `.ae-toolbar, .ae-toolbar-add, .ae-toolbar-styles { z-index: 2000 }`;
    const initialState = `window.__INITIAL_STATE__ = ${JSON.stringify(store.getState())}`;
    const root = PROD && renderToString(
      <Provider store={store}>
        <RouterContext {...renderProps}/>
      </Provider>
    );
    /* eslint-disable react/no-danger */
    return (
      <html style={{height: '100vh', overflowY: 'scroll'}}>
        <head>
          <meta charSet="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>
          {PROD && <link rel="stylesheet" href="/static/prerender.css" type="text/css"/>}
          <link rel="stylesheet" href="/alloy-editor/assets/alloy-editor-ocean-min.css" type="text/css"/>
          <style dangerouslySetInnerHTML={{__html: alloyZConflict}}/>
          <title>{title}</title>
        </head>
        <body style={{minHeight: '100vh'}}>
          <script dangerouslySetInnerHTML={{__html: alloyBasepath}}/>
          <script dangerouslySetInnerHTML={{__html: initialState}}/>
            {PROD ? <div id="root" dangerouslySetInnerHTML={{__html: root}}></div> : <div id="root"></div>}
            {PROD && <script dangerouslySetInnerHTML={{__html: manifest.text}}/>}
            {PROD && <script src={vendor.js}/>}
          <script src={PROD ? app.js : '/static/app.js'}/>
        </body>
      </html>
    );
    /* eslint-enable react/no-danger */
  }
}
