import uuid from 'node-uuid';
import React, {Component, PropTypes} from 'react';

import Drawer from 'material-ui/Drawer';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import FlatButton from 'material-ui/FlatButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import ContentReply from 'material-ui/svg-icons/content/reply';

import NodeForm from '../NodeForm/NodeForm';
import nodeIcon from '../nodeIcon/nodeIcon';
import styles from './NodeEditor.css';

export default class NodeEditor extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    mapId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    addNode: PropTypes.func.isRequired,
    updateNode: PropTypes.func.isRequired,
    deleteNode: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      mode: '',
      open: false,
      responding: false,
      destroy: false,
      node: undefined
    };
  }

  render() {
    return (
      <Drawer
        docked={false}
        width={Math.floor(innerWidth * 0.66)}
        openSecondary
        open={this.state.open}
        onRequestChange={this.handleRequestChange}
        >
        {this.state.node ? this.renderForm() : <div/>}
      </Drawer>
    );
  }

  renderForm = () => {
    return (
      <div id="renderForm">
        {(this.state.mode === 'edit' && !this.readOnly()) ? this.renderDelete() : <div/>}
        {this.state.mode === 'edit' ? this.renderReply() : <div/>}
        <NodeForm
          readOnly={this.readOnly()}
          onSave={this.handleSave}
          action={this.state.mode === 'edit' ? 'Update' : 'Add'}
          {...this.state.node}
          />
      </div>
    );
  };

  renderReply = () => {
    return (
      <div className={styles.reply}>
        <FlatButton
          style={{display: 'block', margin: '0 auto', width: 168}}
          onTouchTap={this.handleTouchTap}
          icon={<ContentReply/>}
          label="Reply"
          primary
          />
        <Popover
          open={this.state.responding}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'right', vertical: 'top'}}
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
      </div>
    );
  };

  renderDelete = () => {
    return (
      <IconMenu
        iconButtonElement={<IconButton touch><MoreVertIcon/></IconButton>}
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
        onChange={this.handleDelete}
        value={this.state.destroy}
        >
        <MenuItem value primaryText="Delete"/>
      </IconMenu>
    );
  };

  readOnly = () => {
    const {userId} = this.props;
    return Boolean(
      userId !== this.state.node.userId ||
      this.props.data.filter(node => node.parentId === this.state.node.id).length
    );
  };

  handleTouchTap = event => {
    event.preventDefault(); // Prevent ghost click on mobile
    this.setState({responding: true, anchorEl: event.currentTarget});
  };

  handleRequestChange = open => {
    this.setState({open, node: undefined});
  };

  handleRequestClose = () => {
    this.setState({responding: false});
  };

  handleChange = (node, type) => {
    setTimeout(this.handleReply, 300, this.state.node, type);
    this.setState({responding: false, open: false, node: undefined});
  };

  handleNewNode = responseType => {
    const {mapId, userId} = this.props;
    this.setState({
      open: true,
      mode: 'create',
      node: {
        id: uuid.v4(),
        responseType,
        mapId,
        userId
      }});
  };

  handleReply = (node, responseType) => {
    const {mapId, userId} = this.props;
    this.setState({
      open: true,
      mode: 'create',
      node: {
        id: uuid.v4(),
        parentId: node.id,
        responseType,
        mapId,
        userId
      },
      parent: node
    });
  };

  handleSelect = nodeRef => {
    const node = {...nodeRef};
    this.setState({
      open: true,
      mode: 'edit',
      node
    });
  };

  handleDelete = () => {
    const {deleteNode} = this.props;
    deleteNode(this.state.node.id);
    this.setState({
      mode: '',
      open: false,
      node: undefined
    });
  };

  handleSave = data => {
    const {updateNode, addNode} = this.props;
    const node = {...this.state.node, ...data};
    const save = this.state.mode === 'edit' ? updateNode : addNode;
    save(node);
    this.setState({open: false, node: undefined});
  };
}
