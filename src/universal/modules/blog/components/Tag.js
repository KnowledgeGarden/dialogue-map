import React, {PropTypes, Component} from 'react';
import FlatButton from 'material-ui/FlatButton';
import {Link} from 'react-router';
import colors from 'universal/styles/colors.css';
import styles from './Tag.css';

export default class Tag extends Component {
  static propTypes = {
    locator: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  }

  render() {
    const {locator, label} = this.props;
    return (
      <Link to={`/blog/${locator}`}>
        <FlatButton
          label={label}
          className={styles.tag}
          backgroundColor={colors.primary}
          hoverColor={colors.primaryDark}
        />
      </Link>
    );
  }
}
