import React, {Component, PropTypes} from 'react';
import {List, MakeSelectable as makeSelectable} from 'material-ui/List';

function wrapState(ComposedComponent) {
  return class SelectableList extends Component {
    static propTypes = {
      children: PropTypes.node.isRequired,
      onChange: PropTypes.func.isRequired
    };

    componentWillMount() {
      this.setState({
        selectedIndex: null
      });
    }

    handleRequestChange = (event, index) => {
      this.setState({
        selectedIndex: index
      });
      this.props.onChange(index);
    };

    render() {
      return (
        <ComposedComponent
          value={this.state.selectedIndex}
          onChange={this.handleRequestChange}
        >
          {this.props.children}
        </ComposedComponent>
      );
    }
  };
}

export default wrapState(makeSelectable(List));
