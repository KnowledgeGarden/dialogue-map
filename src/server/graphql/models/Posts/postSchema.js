import {
  GraphQLBoolean,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLID
} from 'graphql';
import {
  GraphQLTitleType,
  GraphQLDetailsType,
  GraphQLHandleType
} from '../types';
import {makeRequired} from '../utils';

export const Post = new GraphQLObjectType({
  name: 'Post',
  description: 'A blog post',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLID), description: 'The nodeId'},
    language: {type: new GraphQLNonNull(GraphQLID), description: ''},
    title: {type: new GraphQLNonNull(GraphQLTitleType), description: 'The post title'},
    details: {type: new GraphQLNonNull(GraphQLDetailsType), description: 'The post body text'},
    handle: {type: new GraphQLNonNull(GraphQLHandleType), description: 'The handle of the author that created the post'},
    isPrivate: {type: GraphQLBoolean, description: 'Whether the post is visible to other users'},
    createdAt: {type: GraphQLString, description: 'The datetime the post was created'},
    updatedAt: {type: GraphQLString, description: 'The datetime the post was last updated'}
  })
});

const inputFields = {
  id: {type: GraphQLID, description: 'The postId'},
  title: {type: GraphQLTitleType, description: 'The post title'},
  details: {type: GraphQLTitleType, description: 'The post body text'},
  userId: {type: GraphQLID, description: 'The userId that created the post'},
  isPrivate: {type: GraphQLBoolean, description: 'Whether the post is visible to other users'}
};

export const NewPost = new GraphQLInputObjectType({
  name: 'NewPost',
  description: 'Args to add a new blog post',
  fields: () => makeRequired(inputFields, ['title', 'details'])
});
