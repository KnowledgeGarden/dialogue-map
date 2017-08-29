import r from '../../../database/rethinkdriver';
import {isLoggedIn} from '../authorization';
import {getFields} from '../utils';
import {Map} from './mapSchema';

export default {
  getAllMaps: {
    type: Map,
    async resolve(source, args, authToken, refs) {
      const {rootValue: {socket}, fieldName} = refs;
      const requestedFields = Object.keys(getFields(refs));
      isLoggedIn(authToken);
      r.table('maps')
        .filter(r.row('isPrivate').eq(false).or(r.row('userId').eq(authToken.id)))
        .pluck(requestedFields)
        .changes({includeInitial: true, includeStates: true})
        .run({cursor: true}, (err, cursor) => {
          if (err) throw err;
          cursor.each((err, data) => {
            if (err) throw err;
            if (data.state === 'ready') socket.emit(`${fieldName}Done`, true);
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
