import React, {Component, PropTypes} from 'react';
import uuid from 'node-uuid';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import {reduxForm} from 'redux-form';
import {getFormState} from 'universal/redux/helpers';
import styles from './MapForm.css';
export const fields = ['title', 'summary', 'details'];

@reduxForm({form: 'mapForm', fields, getFormState})
export default class MapForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    formAction: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired
  };

  render() {
    const {
      fields: {title},
      handleSubmit
    } = this.props;

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <Paper className={styles.paper}>
          <TextField
            fullWidth
            hintText="Add dialogue map"
            {...title}
            />
          <br/>
        </Paper>
      </form>
    );
  }

  onSubmit = data => {
    const {userId, formAction, resetForm} = this.props;
    const payload = {
      title: data.title,
      id: uuid.v4(),
      userId,
      isPrivate: false
    };
    formAction(payload);
    resetForm();
  };
}
