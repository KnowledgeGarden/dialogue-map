import React, {PropTypes, Component} from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Theme from 'universal/styles/theme';
import styles from './Page.css';

const muiTheme = getMuiTheme(Theme);

export default class Page extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };

  render() {
    return (
      <MuiThemeProvider className={styles.app} muiTheme={muiTheme}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}
