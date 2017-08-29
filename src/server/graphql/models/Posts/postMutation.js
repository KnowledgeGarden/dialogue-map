import {GraphQLNonNull} from 'graphql';
import {topicMap} from '../../../backside/TopicMapDriver';
// import {errorObj} from '../utils';
import {isLoggedIn} from '../authorization';
import {Post, NewPost} from './postSchema';

export default {
  createPost: {
    type: Post,
    args: {
      post: {type: new GraphQLNonNull(NewPost)}
    },
    async resolve(source, {post}, authToken) {
      isLoggedIn(authToken);
      const {token, handle} = authToken;
      const {language, title, details, icon, isPrivate} = post;
      const newPost = await topicMap.addTopic({token, handle}, {
        language: (language || 'en'),
        label: title,
        details,
        icon: (icon || 'publication'),
        isPrivate: (isPrivate || false),
        instanceOf: 'BlogNodeType'
      });
      return newPost;
    }
  }
};
