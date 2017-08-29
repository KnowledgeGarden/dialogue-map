import React, {Component, PropTypes} from 'react';

import Paper from 'material-ui/Paper';
import List from 'material-ui/List';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';

import NodeListItem from '../NodeListItem/NodeListItem';
import nodeIcon from '../nodeIcon/nodeIcon';
import styles from './NodeList.css';

export default class NodeList extends Component {
  static propTypes = {
    /**
     * An array of node data to render.
     * The data might need to be filtered to get the list of nodes for this component.
     */
    data: PropTypes.array.isRequired,

    /**
     * The new reply callback is triggered by a tap on a reply type for a node.
     * (parentId, type) => {}
     */
    onReply: PropTypes.func.isRequired,

    /**
     * The select callback is triggered when a user taps on a node.
     * (node) => {}
     */
    onSelect: PropTypes.func.isRequired,
    view: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false, // the reply popover is open
      anchorEl: undefined, // the element to anchor the reply popover to
      type: undefined // the responseType selected in the reply popover
    };
    this.handleClose = () => {}; // callback to be fired after the reply popover closes
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state !== nextState ||
      this.props.view !== nextProps.view ||
      this.props.data !== nextProps.data
    );
  }

  render() {
    const {data, view} = this.props;
    const noParent = node => node.parentId === undefined;
    const oldToNew = (a, b) => a.createdAt - b.createdAt;
    const newToOld = (a, b) => b.createdAt - a.createdAt;
    let nodes;
    if (view === 'stream') {
      nodes = data.sort(newToOld);
    } else {
      nodes = data.filter(noParent).sort(oldToNew);
    }
    return (
      <div id="nodes">
        {nodes.length ? this.renderNodes(nodes) : this.renderNone()}
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
          useLayerForClickAway={false}
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
  }

  renderNone = () => {
    return (
      <Paper zDepth={0} className={styles.paper} style={{padding: '20 16', textAlign: 'center'}}>
        no nodes yet
      </Paper>
    );
  };

  renderNodes = nodes => {
    return (
      <Paper zDepth={1} className={styles.paper}>
        <List>
          {nodes.map(this.renderNode)}
        </List>
      </Paper>
    );
  };

  renderNode = node => {
    return (
      <NodeListItem
        {...this.props}
        key={`node${node.id}`}
        node={node}
        nestedLevel={0}
        onReplyTouchTap={this.handleReplyTouchTap}
        />
    );
  };

  handleReplyTouchTap = (event, hoverId, handleClose) => {
    this.setState({open: true, hoverId, anchorEl: event.currentTarget});
    this.handleClose = handleClose;
  };

  handleChange = (event, responseType) => {
    const {onReply, data} = this.props;
    const {hoverId} = this.state;
    const node = data.filter(node => node.id === hoverId)[0];
    this.setState({open: false});
    this.handleClose();
    onReply(node, responseType);
  };

  handleRequestClose = () => {
    this.setState({open: false});
    setTimeout(() => {
      this.handleClose();
    }, 50);
  };
}
