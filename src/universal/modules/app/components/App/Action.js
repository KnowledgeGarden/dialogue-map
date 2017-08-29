import React, {PropTypes, Component} from 'react';
import {Link} from 'react-router';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import styles from './App.css';

export default class Action extends Component {
  static propTypes = {
    margin: PropTypes.number.isRequired,
    route: PropTypes.string.isRequired
  }

  render() {
    const {margin, route} = this.props;
    return (
      <Link to={route}>
        <FloatingActionButton
          className={styles.action}
          style={{
            opacity: (margin / 96 || 0),
            display: (margin / 96 ? 'inherit' : 'none')
          }}
          secondary
        >
          <ContentAdd/>
        </FloatingActionButton>
      </Link>
    );
  }
}
