import React, {Component, PropTypes} from 'react';

import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';

import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import DropDownMenu from 'material-ui/DropDownMenu';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import ContentAdd from 'material-ui/svg-icons/content/add';
import CommunicationImportExport from 'material-ui/svg-icons/communication/import-export';

import nodeIcon from '../nodeIcon/nodeIcon';

export default class MapToolbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      type: undefined
    };
  }

  static propTypes = {
    ready: PropTypes.bool.isRequired,
    hasData: PropTypes.bool.isRequired,
    mapId: PropTypes.string.isRequired,
    view: PropTypes.string.isRequired,
    onImport: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
    onNewNode: PropTypes.func.isRequired
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  render() {
    const {ready, view} = this.props;
    return (
      <Toolbar>
        <ToolbarGroup firstChild>
          <DropDownMenu value={view} onChange={this.handleViewChange}>
            <MenuItem value={'tree'} label="View" primaryText="Tree View"/>
            <MenuItem value={'stream'} label="View" primaryText="Stream View"/>
          </DropDownMenu>
        </ToolbarGroup>
        {ready ? this.renderReady() : <div/>}
      </Toolbar>
    );
  }

  renderReady = () => {
    const {hasData, onExport, onImport} = this.props;
    return (
      <ToolbarGroup float="right">
        <FlatButton
          onTouchTap={hasData ? onExport : onImport}
          icon={<CommunicationImportExport/>}
          label={hasData ? 'export' : 'import'}
          />
        <RaisedButton
          onTouchTap={this.handleTouchTap}
          icon={<ContentAdd/>}
          label="Add root node"
          />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
          >
          <Menu value={this.state.type} onChange={this.handleChange}>
            <MenuItem leftIcon={nodeIcon('QUESTION', 26)} primaryText="Question" value="QUESTION"/>
            <MenuItem leftIcon={nodeIcon('ANSWER', 26)} primaryText="Answer" value="ANSWER"/>
            <MenuItem leftIcon={nodeIcon('PRO', 26)} primaryText="Pro" value="PRO"/>
            <MenuItem leftIcon={nodeIcon('CON', 26)} primaryText="Con" value="CON"/>
          </Menu>
        </Popover>
      </ToolbarGroup>
    );
  }

  handleViewChange = (event, index, value) => {
    const {router} = this.context;
    const {mapId} = this.props;
    router.push(`/maps/${mapId}/${value}`);
  };

  handleTouchTap = event => {
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  };

  handleChange = (event, type) => {
    const {onNewNode} = this.props;
    onNewNode(type);
    this.setState({open: false});
  };

  handleRequestClose = () => {
    this.setState({open: false});
  };
}
