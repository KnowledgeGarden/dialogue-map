import React, {PropTypes, Component} from 'react';
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card';
import Tag from './Tag';
import styles from './Post.css';

export default class Post extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    post: PropTypes.shape({
      title: PropTypes.string.isRequired,
      details: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      handle: PropTypes.string.isRequired,
      tags: PropTypes.array,
      createdAt: PropTypes.number.isRequired,
      updatedAt: PropTypes.number.isRequired
    }).isRequired,
    postActions: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired
  }

  render() {
    const {handle, title, details, tags, createdAt} = this.props.post;
    return (
      <Card className={styles.post}>
        <CardHeader
          title={`@${handle}`}
          subtitle={(new Date(createdAt)).toLocaleString('en')}
          avatar={`http://lorempixel.com/300/300/nature/${handle}/`}
        />
        <CardTitle title={title}/>
        <CardText>{details}</CardText>
        <CardText>
          {tags && tags.map(tag => <Tag key={tag.locator} {...tag}/>)}
        </CardText>
      </Card>
    );
  }
}
