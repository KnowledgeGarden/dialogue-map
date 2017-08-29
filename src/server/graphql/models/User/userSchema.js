import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList
} from 'graphql';
import {
  GraphQLHandleType,
  GraphQLEmailType,
  GraphQLPermissionType
} from '../types';
import {resolveForAdmin} from '../utils';

const LocalStrategy = new GraphQLObjectType({
  name: 'LocalStrategy',
  description: 'The local (username, password) strategy for a user account',
  fields: () => ({
    isVerified: {type: GraphQLBoolean, description: 'Account state of email verification'},
    password: {
      type: GraphQLString,
      description: 'Hashed password',
      resolve: () => null
    },
    verifiedEmailToken: {
      type: GraphQLString,
      description: 'The token sent to the user\'s email for verification',
      resolve: (source, args, authToken) => resolveForAdmin(source, args, authToken)
    },
    resetToken: {
      type: GraphQLString,
      description: 'The token used to reset the user\'s password',
      resolve: (source, args, authToken) => resolveForAdmin(source, args, authToken)
    }
  })
});

const UserStrategies = new GraphQLObjectType({
  name: 'UserStrategies',
  fields: () => ({
    local: {type: LocalStrategy, description: 'The local authentication strategy'}
  })
});

export const User = new GraphQLObjectType({
  name: 'User',
  description: 'The user account',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The userId'},
    name: {type: GraphQLString, description: 'The user full name'},
    handle: {type: GraphQLHandleType, description: 'The user handle'},
    email: {type: new GraphQLNonNull(GraphQLEmailType), description: 'The user email'},
    role: {type: new GraphQLList(GraphQLPermissionType), description: 'A list of user permissions'},
    createdAt: {type: GraphQLString, description: 'The datetime the user was created'},
    updatedAt: {type: GraphQLString, description: 'The datetime the user was last updated'},
    strategies: {type: UserStrategies, description: 'The login strategies used by the user'}
  })
});

export const UserWithAuthToken = new GraphQLObjectType({
  name: 'UserWithAuthToken',
  description: 'The user account with an optional auth token',
  fields: () => ({
    user: {type: User, description: 'The user account'},
    authToken: {type: GraphQLString, description: 'The auth token to allow for quick login'}
  })
});
