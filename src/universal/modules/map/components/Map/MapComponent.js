import uuid from 'node-uuid';
import React, {Component, PropTypes} from 'react';

import RefreshIndicator from 'material-ui/RefreshIndicator';

import MapToolbar from '../MapToolbar/MapToolbar.js';
import NodeList from '../NodeList/NodeList.js';
import NodeEditor from '../NodeEditor/NodeEditor.js';
import styles from './MapComponent.css';

export default class MapComponent extends Component {
  static propTypes = {
    userId: PropTypes.string.isRequired,
    mapId: PropTypes.string.isRequired,
    nodeActions: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired,
    view: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired
  };

  render() {
    const {nodeActions, mapId, userId, ready, data, view} = this.props;
    const hasData = data.length > 0;
    return (
      <div id="dialogue">
        <MapToolbar
          ready={ready}
          hasData={hasData}
          mapId={mapId}
          view={view}
          onNewNode={this.handleNewNode}
          onImport={this.handleImport}
          onExport={this.handleExport}
          />
        <NodeEditor ref={this.mountEditor} {...nodeActions} mapId={mapId} userId={userId} data={data}/>
        <div style={{display: ready ? 'none' : 'inherit', position: 'relative', width: 50, margin: '100px auto'}}>
          <RefreshIndicator size={50} top={0} left={0} status={ready ? 'hide' : 'loading'}/>
        </div>
        {ready ? this.renderComponent() : <div/>}
      </div>
    );
  }

  renderComponent = () => {
    const {data, view} = this.props;
    return (
      <div className={styles.nodes}>
        <NodeList
          data={data}
          view={view}
          onReply={this.handleReply}
          onSelect={this.handleSelect}
          />
      </div>
    );
  };

  mountEditor = component => {
    this.editor = component;
  };

  handleNewNode = type => {
    this.editor.handleNewNode(type);
  };

  handleImport = () => {
    const {mapId, nodeActions: {addNode}} = this.props;
    const input = document.createElement('input');
    input.type = 'file';
    input.click();
    input.addEventListener('change', () => {
      if (input.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          const data = JSON.parse(reader.result);
          const reKey = {};
          data.sort((a, b) => {
            return a.createdAt > b.createdAt;
          }).map(doc => {
            const id = uuid.v4();
            reKey[doc.id] = id;
            return {...doc, id, mapId};
          }).map(doc => {
            const parentId = doc.parentId && reKey[doc.parentId];
            return {...doc, parentId};
          }).forEach(doc => {
            addNode(doc);
          });
        };
        reader.readAsText(input.files[0]);
      }
      input.remove();
    }, false);
  };

  handleExport = () => {
    const {mapId, data} = this.props;
    const a = document.createElement('a');
    a.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
    a.download = `${mapId}-map.json`;
    a.click();
    a.remove();
  };

  handleReply = (parentId, type) => {
    this.editor.handleReply(parentId, type);
  };

  handleSelect = node => {
    this.editor.handleSelect(node);
  };
}
