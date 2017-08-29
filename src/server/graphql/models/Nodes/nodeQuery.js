import {GraphQLNonNull, GraphQLID} from 'graphql';
import r from '../../../database/rethinkdriver';
import {errorObj} from '../utils';
import {isLoggedIn} from '../authorization';
import {Node} from './nodeSchema';

export default {
  getNodeById: {
    type: Node,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, {id}, authToken) {
      isLoggedIn(authToken);
      const node = await r.table('nodes').get(id);
      if (!node) {
        throw errorObj({_error: 'Node not found'});
      }
      return node;
    }
  }
};

