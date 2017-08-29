import React, {Component, PropTypes} from 'react';
import Paper from 'material-ui/Paper';
import SelectableList from 'universal/components/SelectableList/SelectableList';
import {ListItem} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import styles from './MapList.css';

export default class MapList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      destroy: {
        mapId: undefined
      }
    };
  }

  static propTypes = {
    mapActions: PropTypes.object.isRequired,
    maps: PropTypes.object.isRequired
  };

  static contextTypes = {
    router: React.PropTypes.object.isRequired
  };

  handleDelete = (event, mapId) => {
    const {mapActions: {deleteMap}} = this.props;
    deleteMap(mapId);
  };

  handleSelect = mapId => {
    const {router} = this.context;
    router.push(`/maps/${mapId}/tree`);
  };

  render() {
    const {data} = this.props.maps;
    return (
      <div id="maps">{data.length ? this.renderMaps(data) : this.renderNone(data)}</div>
    );
  }

  renderMaps = data => {
    return (
      <Paper zDepth={1} className={styles.paper}>
        <SelectableList onChange={this.handleSelect}>
          {data.map(this.renderMap)}
        </SelectableList>
      </Paper>
    );
  };

  renderNone = () => {
    return <div></div>;
  };

  renderMap = map => {
    const mapId = map.id;

    const iconButtonElement = (
      <IconButton touch>
        <MoreVertIcon/>
      </IconButton>
    );

    const rightIconMenu = (
      <IconMenu
        iconButtonElement={iconButtonElement}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        onChange={this.handleDelete}
        value={this.state.destroy.mapId}
        >
        <MenuItem value={mapId} primaryText="Delete"/>
      </IconMenu>
    );

    return (
      <ListItem
        key={`map${map.id}`}
        value={map.id}
        primaryText={map.title}
        secondaryText={map.summary}
        rightIconButton={rightIconMenu}
        />
    );
  };
}
