import React, {PropTypes, Component} from 'react';
import SocialPublic from 'material-ui/svg-icons/social/public';
import styles from './Blog.css';

export default class Blog extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  }

  render() {
    return (
      <div className={styles.blog}>
        {this.props.children.size ? this.props.children : this.renderEmpty()}
      </div>
    );
  }

  renderEmpty() {
    return (
      <div className={styles.empty}>
        <SocialPublic className={styles.icon}/>
        <h3>There aren't any blog posts</h3>
      </div>
    );
  }
}
