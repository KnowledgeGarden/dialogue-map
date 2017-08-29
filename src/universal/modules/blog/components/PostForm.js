import React, {PropTypes, Component} from 'react';
import ReactDOM from 'react-dom';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import {createPost} from '../ducks/posts';
import styles from './PostForm.css';

export default class PostForm extends Component {
  static propTypes = {
    fields: PropTypes.shape({
      title: PropTypes.object.isRequired,
      details: PropTypes.object.isRequired
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    postError: PropTypes.string
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  render() {
    const {
      fields: {title, details},
      handleSubmit,
      postError
    } = this.props;
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <Paper className={styles.post}>
          <TextField
            {...title}
            className={styles.spacing}
            floatingLabelText="Title"
            errorText={title.touched && title.error || ''}
            underlineShow={false}
            fullWidth
          />
          <Divider className={styles.full}/>
          <TextField
            {...details}
            className={styles.spacing}
            floatingLabelText="Details"
            errorText={details.touched && details.error || ''}
            underlineShow={false}
            rows={3}
            multiLine
            fullWidth
          />
          {postError && <div className={styles.postError}>{postError}</div>}
          <FlatButton
            ref={this.mountSubmit}
            className={styles.full}
            label="Publish"
            type="submit"
            secondary
          />
        </Paper>
      </form>
    );
  }

  mountSubmit = element => {
    this.submitButton = element;
  }

  handleKeyDown = event => {
    if (!(event.keyCode === 13 && event.metaKey)) return;
    const click = new MouseEvent('click', {view: window, bubbles: true, cancelable: false});
    const submit = ReactDOM.findDOMNode(this.submitButton);
    if (submit) submit.dispatchEvent(click);
  }

  onSubmit = (data, dispatch) => {
    const redirectRoute = '/blog';
    return createPost(dispatch, data, redirectRoute);
  }
}
