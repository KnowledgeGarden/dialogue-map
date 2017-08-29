import {GraphQLNonNull, GraphQLID} from 'graphql';
import r from '../../../database/rethinkdriver';
import {isLoggedIn} from '../authorization';
import {errorObj} from '../utils';
import {Map} from './mapSchema';

export default {
  getMapById: {
    type: Map,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, {id}, authToken) {
      isLoggedIn(authToken);
      const {id: verifiedId, isAdmin} = authToken;
      const map = await r.table('maps').get(id);
      if (!map) {
        throw errorObj({_error: 'Map not found'});
      }
      if (map.isPrivate && map.userId !== verifiedId && !isAdmin) {
        throw errorObj({_error: 'Unauthorized'});
      }
      return map;
    }
  }
};
