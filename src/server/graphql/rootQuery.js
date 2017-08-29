import {GraphQLObjectType} from 'graphql';
import user from './models/User/userQuery';
import map from './models/Maps/mapQuery';
import node from './models/Nodes/nodeQuery';
import post from './models/Posts/postQuery';

const rootFields = Object.assign(user, map, node, post);

export default new GraphQLObjectType({
  name: 'RootQuery',
  fields: () => rootFields
});
