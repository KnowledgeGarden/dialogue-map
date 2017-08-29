import React, {Component} from 'react';
import {Link} from 'react-router';
import styles from './Footer.css';

export default class Footer extends Component {
  render() {
    return (
      <div className={styles.Footer}>
        <div className={styles.container}>
          <span className={styles.text}>Dialogue Mapper</span>
          <span className={styles.spacer}>·</span>
          <Link to="/" className={styles.link}>Home</Link>
          <span className={styles.spacer}>·</span>
          <Link to="/maps" className={styles.link}>Maps</Link>
          <span className={styles.spacer}>·</span>
          <Link to="/not-found" className={styles.link}>Not found</Link>
        </div>
      </div>
    );
  }
}
