import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import {
  GraphQLTitleType,
  GraphQLSummaryType,
  GraphQLDetailsType,
  GraphQLResponseType
} from '../types';
import {makeRequired} from '../utils';

export const Node = new GraphQLObjectType({
  name: 'Node',
  description: 'A dialogue map node',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The nodeId'},
    userId: {type: new GraphQLNonNull(GraphQLID), description: 'The userId that created the map'},
    mapId: {type: new GraphQLNonNull(GraphQLID), description: 'The mapId that the node belongs to'},
    parentId: {type: GraphQLID, description: 'The nodeId of the parent node'},
    title: {type: new GraphQLNonNull(GraphQLTitleType), description: 'The node title'},
    summary: {type: new GraphQLNonNull(GraphQLSummaryType), description: 'The node summary'},
    details: {type: new GraphQLNonNull(GraphQLDetailsType), description: 'The node details'},
    responseType: {type: new GraphQLNonNull(GraphQLResponseType), description: 'The node response type'},
    createdAt: {type: GraphQLString, description: 'The datetime the node was created'},
    updatedAt: {type: GraphQLString, description: 'The datetime the node was last updated'}
  })
});

const inputFields = {
  id: {type: GraphQLID, description: 'The mapId'},
  userId: {type: GraphQLID, description: 'The userId that created the map'},
  mapId: {type: GraphQLID, description: 'The mapId that the node belongs to'},
  parentId: {type: GraphQLID, description: 'The nodeId of the parent node'},
  title: {type: GraphQLTitleType, description: 'The node title'},
  summary: {type: GraphQLSummaryType, description: 'The node summary'},
  details: {type: GraphQLDetailsType, description: 'The node details'},
  responseType: {type: GraphQLResponseType, description: 'The node response type'}
};

export const UpdatedNode = new GraphQLInputObjectType({
  name: 'UpdatedNode',
  description: 'Args to update a node in a dialogue map',
  fields: () => makeRequired(inputFields, ['id'])
});

export const NewNode = new GraphQLInputObjectType({
  name: 'NewNode',
  description: 'Args to add a node in dialogue map',
  fields: () => makeRequired(inputFields, ['userId', 'mapId', 'title', 'responseType'])
});
