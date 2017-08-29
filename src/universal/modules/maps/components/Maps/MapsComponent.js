import React, {Component, PropTypes} from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import MapList from '../MapList/MapList.js';
import MapForm from '../MapForm/MapForm.js';

export default class MapsComponent extends Component {
  static propTypes = {
    mapActions: PropTypes.object.isRequired,
    maps: PropTypes.object.isRequired,
    userId: PropTypes.string.isRequired,
    ready: PropTypes.bool.isRequired
  };

  render() {
    const {ready} = this.props;
    return (
      <div id="MapsComponent">
        <div style={{display: ready ? 'none' : 'inherit', position: 'relative', width: 50, margin: '100px auto'}}>
          <RefreshIndicator size={50} top={0} left={0} status={ready ? 'hide' : 'loading'}/>
        </div>
        {ready ? this.renderComponent() : <div id="Maps"/>}
      </div>
    );
  }

  renderComponent = () => {
    const {userId, mapActions: {addMap}} = this.props;
    return (
      <div id="Maps">
        <MapForm formAction={addMap} userId={userId}/>
        <MapList {...this.props}/>
      </div>
    );
  }
}
