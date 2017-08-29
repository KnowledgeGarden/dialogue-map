import React, {Component, PropTypes} from 'react';
import classNames from 'classnames';

import {ListItem} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import ArrowDropUp from 'material-ui/svg-icons/navigation/arrow-drop-up';
import ArrowDropDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ContentReply from 'material-ui/svg-icons/content/reply';

import nodeIcon from '../nodeIcon/nodeIcon';
import styles from './NodeListItem.css';

export default class NodeListItem extends Component {
  static propTypes = {
    /**
     * The current object to render.
     */
    node: PropTypes.object.isRequired,

    /**
     * An array of node data to render.
     * The data might need to be filtered to get the list of nodes for this component.
     */
    data: PropTypes.array.isRequired,

    /**
     * The select callback is triggered when a user taps on a node.
     * (node) => {}
     */
    onSelect: PropTypes.func.isRequired,

    /**
     * The reply callback is triggered when a user taps on a reply type.
     * (event, nodeId, ()=>{}) => {}
     */
    onReplyTouchTap: PropTypes.func.isRequired,

    /**
     * The view to render the map with.
     */
    view: PropTypes.string.isRequired,

    /**
     * The tree depth of this NodeListItem
     */
    nestedLevel: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      hovered: false, // the node is currently hovered
      toggle: false // collapse the child nodes
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.state !== nextState ||
      this.props.view !== nextProps.view ||
      this.props.data !== nextProps.data
    );
  }

  render() {
    const {node, data, nestedLevel} = this.props;
    const className = classNames(styles.node, {[styles.hovered]: this.state.hovered || this.state.open});
    const thisParent = child => child.parentId === node.id;
    const oldToNew = (a, b) => a.createdAt - b.createdAt;
    this.children = data.filter(thisParent).sort(oldToNew);
    return (
      <ListItem
        key={`listItem{node.id}`}
        ref={this.mountListItem}
        nestedLevel={nestedLevel}
        className={className}
        leftAvatar={nodeIcon(node.responseType)}
        primaryText={node.title}
        secondaryText={node.summary}
        initiallyOpen
        nestedItems={this.renderChildNodes(node.id)}
        onTouchTap={this.handleTouchTap}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        rightIconButton={
          <div>
            {this.renderReply()}
            {this.renderToggle()}
          </div>
        }
        />
    );
  }

  renderChildNodes = () => {
    const {nestedLevel, view} = this.props;
    if (view === 'stream') return [];
    return this.children.map(node => {
      return (
        <NodeListItem
          {...this.props}
          key={`node${node.id}`}
          node={node}
          nestedLevel={nestedLevel + 1}
          />
      );
    });
  };

  renderReply = () => {
    if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)) {
      return this.renderReplyButton();
    }
    return (this.state.hovered || this.state.open ? this.renderReplyButton() : <IconButton/>);
  };

  renderReplyButton = () => {
    return (
      <IconButton onTouchTap={this.handleReplyTouchTap}>
        <ContentReply/>
      </IconButton>
    );
  };

  renderToggle = () => {
    const {view} = this.props;
    if (view === 'stream') return <div/>;
    return this.children.length ? this.renderToggleButton() : <IconButton/>;
  };

  renderToggleButton = () => {
    return (
      <IconButton onTouchTap={this.handleToggleTouchTap}>
        {this.state.toggle ? <ArrowDropDown/> : <ArrowDropUp/>}
      </IconButton>
    );
  };

  mountListItem = component => {
    this.listItem = component;
  };

  handleTouchTap = () => {
    const {node, onSelect} = this.props;
    onSelect(node);
  }

  handleReplyTouchTap = event => {
    const {node, onReplyTouchTap} = this.props;
    if (this.state.open) {
      this.setState({open: false});
    } else {
      this.setState({open: true});
      onReplyTouchTap(event, node.id, () => this.setState({open: false}));
    }
  };

  handleToggleTouchTap = event => {
    this.setState({toggle: !this.state.toggle});
    this.listItem.handleNestedListToggle(event);
  };

  handleMouseEnter = () => {
    this.setState({hovered: true});
  }

  handleMouseLeave = () => {
    this.setState({hovered: false});
  };

}
