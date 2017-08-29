import React, {Component, PropTypes} from 'react';

import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';

import AlloyEditorComponent from '../AlloyEditor/AlloyEditorComponent';
import nodeIcon from '../nodeIcon/nodeIcon';
import styles from './NodeForm.css';

export default class NodeForm extends Component {
  static propTypes = {
    readOnly: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    action: PropTypes.string.isRequired,
    responseType: PropTypes.string.isRequired,
    title: PropTypes.string,
    summary: PropTypes.string,
    details: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      title: props.title || '',
      summary: props.summary || '',
      details: props.details || ''
    };
  }

  render() {
    const {
      action,
      responseType,
      readOnly
    } = this.props;
    const disabled = (!this.state.title);

    return (
      <form onSubmit={this.handleSubmit}>
        <Paper zDepth={0} className={styles.paper}>
          {nodeIcon(responseType)}<br/>
          <TextField
            value={this.state.title}
            onChange={this.handleTitleChange}
            hintText="Title"
            floatingLabelText={hintText(responseType)}
            disabled={readOnly}
            className={styles.readable}
            />
          <br/>
          <TextField
            value={this.state.summary}
            onChange={this.handleSummaryChange}
            hintText="Define the context"
            floatingLabelText="Summary"
            fullWidth
            disabled={readOnly}
            className={styles.readable}
            />
          <br/>
          <AlloyEditorComponent
            id="editable"
            className={styles.details}
            config={{}}
            onChange={this.handleDetailsChange}
            initialData={this.state.details}
            placeholder="Details"
            />
          {readOnly ? <div/> : <FlatButton disabled={disabled} secondary label={actionText(action, responseType)} type="submit" style={{float: 'right'}}/>}
        </Paper>
      </form>
    );
  }

  handleChangeFor = field => event => {
    this.setState({[field]: event.target.value});
  }

  handleTitleChange = this.handleChangeFor('title');
  handleSummaryChange = this.handleChangeFor('summary');
  handleDetailsChange = snapshot => {
    this.setState({details: snapshot});
  };

  handleSubmit = event => {
    event.preventDefault();
    const {onSave} = this.props;
    onSave(this.state);
  };
}

function hintText(responseType) {
  switch (responseType) {
    case 'QUESTION': return 'Question';
    case 'ANSWER': return 'Answer';
    case 'PRO': return 'Pro';
    case 'CON': return 'Con';
    default: throw new Error(`undefined responseType: ${responseType}`);
  }
}

function actionText(action, responseType) {
  return `${action} ${hintText(responseType)}`;
}
