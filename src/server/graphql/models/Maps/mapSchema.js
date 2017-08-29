import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} from 'graphql';
import {GraphQLTitleType} from '../types';
import {makeRequired} from '../utils';
import {Node} from '../Nodes/nodeSchema';
import r from '../../../database/rethinkdriver';

export const Map = new GraphQLObjectType({
  name: 'Map',
  description: 'A dialogue map',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The mapId'},
    userId: {type: new GraphQLNonNull(GraphQLID), description: 'The userId that created the map'},
    isPrivate: {type: GraphQLBoolean, description: 'Whether the map is visible to other users'},
    title: {type: new GraphQLNonNull(GraphQLTitleType), description: 'The map title'},
    createdAt: {type: GraphQLString, description: 'The datetime the map was created'},
    updatedAt: {type: GraphQLString, description: 'The datetime the map was last updated'},
    nodes: {
      type: new GraphQLList(Node),
      description: 'The nodes in a given map',
      resolve(source) {
        return r.table('nodes').getAll(source.id, {index: 'mapId'}).run();
      }
    }
  })
});

const inputFields = {
  id: {type: GraphQLID, description: 'The mapId'},
  userId: {type: GraphQLID, description: 'The userId that created the map'},
  isPrivate: {type: GraphQLBoolean, description: 'Whether the map is visible to other users'},
  title: {type: GraphQLTitleType, description: 'The map title'}
};

export const UpdatedMap = new GraphQLInputObjectType({
  name: 'UpdatedMap',
  description: 'Args to update a dialogue map',
  fields: () => makeRequired(inputFields, ['id'])
});

export const NewMap = new GraphQLInputObjectType({
  name: 'NewMap',
  description: 'Args to add a dialogue map',
  fields: () => makeRequired(inputFields, ['userId', 'title'])
});
