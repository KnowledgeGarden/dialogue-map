import {GraphQLNonNull, GraphQLID, GraphQLList} from 'graphql';
import {topicMap} from '../../../backside/TopicMapDriver';
import {errorObj} from '../utils';
import {Post} from './postSchema';

export default {
  getPostById: {
    type: Post,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, {id}) {
      const post = await topicMap.fetchTopic(id);
      if (!post) {
        throw errorObj({_error: 'Post not found'});
      }
      if (!post.instanceOf === 'BlogNodeType') {
        throw errorObj({_error: 'Not a blog post'});
      }
      return post;
    }
  },
  getAllPosts: {
    type: new GraphQLList(Post),
    async resolve() {
      return topicMap.listTopicInstances({inOf: 'BlogNodeType'});
    }
  }
};
