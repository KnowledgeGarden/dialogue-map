import {GraphQLObjectType} from 'graphql';
import map from './models/Maps/mapSubscription';
import node from './models/Nodes/nodeSubscription';

const rootFields = Object.assign(map, node);

export default new GraphQLObjectType({
  name: 'RootSubscription',
  fields: () => rootFields
});
