import {GraphQLSchema} from 'graphql';

import query from './rootQuery';
import mutation from './rootMutation';
import subscription from './rootSubscription';

export default new GraphQLSchema({query, mutation, subscription});
