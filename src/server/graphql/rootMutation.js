import {GraphQLObjectType} from 'graphql';
import user from './models/User/userMutation';
import map from './models/Maps/mapMutation';
import node from './models/Nodes/nodeMutation';
import post from './models/Posts/postMutation';

const rootFields = Object.assign(user, map, node, post);

export default new GraphQLObjectType({
  name: 'Mutation',
  fields: () => rootFields
});
