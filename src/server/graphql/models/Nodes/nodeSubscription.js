import {GraphQLNonNull, GraphQLID} from 'graphql';
import r from '../../../database/rethinkdriver';
import {isLoggedIn} from '../authorization';
import {getFields} from '../utils';
import {Node} from './nodeSchema';

export default {
  getMapNodes: {
    type: Node,
    args: {
      mapId: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, {mapId}, authToken, refs) {
      const {rootValue: {socket}, fieldName} = refs;
      const requestedFields = Object.keys(getFields(refs));
      isLoggedIn(authToken);
      r.table('nodes')
        .filter(r.row('mapId').eq(mapId))
        .pluck(requestedFields)
        .changes({includeInitial: true, includeStates: true})
        .run({cursor: true}, (err, cursor) => {
          if (err) throw err;
          cursor.each((err, data) => {
            if (err) throw err;
            if (data.state === 'ready') socket.emit(`${fieldName}Done`, {mapId});
            if (data.state) return;
            const docId = data.new_val ? data.new_val.id : data.old_val.id;
            if (socket.docQueue.has(docId)) {
              socket.docQueue.delete(docId);
            } else {
              socket.emit(fieldName, data);
            }
          });
          socket.on('unsubscribe', channelName => {
            if (channelName === fieldName && cursor) {
              cursor.close();
            }
          });
        });
    }
  }
};

