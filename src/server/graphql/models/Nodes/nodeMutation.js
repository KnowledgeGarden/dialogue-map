import {GraphQLNonNull, GraphQLBoolean, GraphQLID} from 'graphql';
import r from '../../../database/rethinkdriver';
import {errorObj} from '../utils';
import {isLoggedIn} from '../authorization';
import {Node, NewNode, UpdatedNode} from './nodeSchema';

export default {
  addNode: {
    type: Node,
    args: {
      node: {type: new GraphQLNonNull(NewNode)}
    },
    async resolve(source, {node}, authToken) {
      isLoggedIn(authToken);
      node.createdAt = new Date();
      const newNode = await r.table('nodes').insert(node, {returnChanges: true});
      if (newNode.errors) {
        throw errorObj({_error: 'Could not add node'});
      }
      return newNode.changes[0].new_val;
    }
  },
  updateNode: {
    type: Node,
    args: {
      node: {type: new GraphQLNonNull(UpdatedNode)}
    },
    async resolve(source, {node}, authToken) {
      isLoggedIn(authToken);
      node.updatedAt = new Date();
      const {id, ...updates} = node;
      const updatedNode = await r.table('nodes').get(id).update(updates, {returnChanges: true});
      if (updatedNode.errors) {
        throw errorObj({_error: 'Could not update node'});
      }
      return updatedNode.changes[0].new_val;
    }
  },
  deleteNode: {
    type: GraphQLBoolean,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, {id}, authToken) {
      isLoggedIn(authToken);
      const result = await r.table('nodes').get(id).delete();
      // return true is delete succeeded, false if doc wasn't found
      return Boolean(result.deleted);
    }
  }
};
