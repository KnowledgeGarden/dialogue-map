import React, {Component} from 'react';
import styles from './NotFound.css';

export default class NotFound extends Component {
  render() {
    return (
      <div className={styles.notFound}>
        <h1>404 Not Found</h1>
      </div>
    );
  }
}
