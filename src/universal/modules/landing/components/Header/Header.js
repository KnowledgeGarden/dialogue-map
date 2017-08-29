import React, {Component} from 'react';
import {Link} from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import styles from './Header.css';

export default class Header extends Component {
  render() {
    return (
      <div className={styles.header}>
        <div className={styles.banner}>
          <h1 className={styles.bannerTitle}>Welcome to the Demo</h1>
          <h3 className={styles.bannerDesc}>This is just a test. It might explode at any time.</h3>
          <div className={styles.tryButton}>
            <Link to="/signup">
              <RaisedButton secondary label="Register"/>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
