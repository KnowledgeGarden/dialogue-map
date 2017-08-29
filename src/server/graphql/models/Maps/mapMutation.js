import {GraphQLNonNull, GraphQLBoolean, GraphQLID} from 'graphql';
import r from '../../../database/rethinkdriver';
import {errorObj} from '../utils';
import {isLoggedIn} from '../authorization';
import {Map, NewMap, UpdatedMap} from './mapSchema';

export default {
  addMap: {
    type: Map,
    args: {
      map: {type: new GraphQLNonNull(NewMap)}
    },
    async resolve(source, {map}, authToken) {
      isLoggedIn(authToken);
      map.createdAt = new Date();
      const newMap = await r.table('maps').insert(map, {returnChanges: true});
      if (newMap.errors) {
        throw errorObj({_error: 'Could not add map'});
      }
      return newMap.changes[0].new_val;
    }
  },
  updateMap: {
    type: Map,
    args: {
      map: {type: new GraphQLNonNull(UpdatedMap)}
    },
    async resolve(source, {map}, authToken) {
      isLoggedIn(authToken);
      map.updatedAt = new Date();
      const {id, ...updates} = map;
      const updatedMap = await r.table('maps').get(id).update(updates, {returnChanges: true});
      if (updatedMap.errors) {
        throw errorObj({_error: 'Could not update map'});
      }
      return updatedMap.changes[0].new_val;
    }
  },
  deleteMap: {
    type: GraphQLBoolean,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, {id}, authToken) {
      isLoggedIn(authToken);
      const {id: verifiedId, isAdmin} = authToken;
      if (!isAdmin) {
        const mapToDelete = await r.table('maps').get(id);
        if (!mapToDelete) {
          return false;
        }
        if (mapToDelete.userId !== verifiedId) {
          throw errorObj({_error: 'Unauthorized'});
        }
      }
      const result = await r.table('maps').get(id).delete();
      // return true is delete succeeded, false if doc wasn't found
      return Boolean(result.deleted);
    }
  }
};
