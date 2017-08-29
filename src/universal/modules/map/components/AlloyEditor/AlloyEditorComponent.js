import React, {Component, PropTypes} from 'react';
import AlloyEditor from 'alloyeditor';

export default class AlloyEditorComponent extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    className: PropTypes.string,
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    initialData: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {data: props.initialData};
  }

  componentDidMount() {
    this.alloy = AlloyEditor.editable(this.props.id, this.props.config);
    this.ck = this.alloy.get('nativeEditor');
    this.ck.on('change', this.handleChange);
    this.ck.setData(this.state.data);
  }

  componentWillUnmount() {
    this.alloy.destroy();
  }

  render() {
    const {id, className, placeholder} = this.props;
    return (
      <div id={id} className={className} data-placeholder={placeholder}>
        {this.state.data}
      </div>
    );
  }

  handleChange = () => {
    const {onChange} = this.props;
    onChange(this.ck.getSnapshot());
  };
}
