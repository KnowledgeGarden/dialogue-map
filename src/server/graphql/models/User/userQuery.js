import {GraphQLNonNull, GraphQLID} from 'graphql';
import promisify from 'es6-promisify';
import bcrypt from 'bcrypt';

import r from '../../../database/rethinkdriver';
import {auths} from '../../../backside/AuthDriver';
import {isAdminOrSelf} from '../authorization';
import {GraphQLEmailType, GraphQLPasswordType} from '../types';
import {errorObj} from '../utils';
import {User, UserWithAuthToken} from './userSchema';
import {getUserByEmail, signJwt, getAltLoginMessage} from './helpers';

const compare = promisify(bcrypt.compare);

export default {
  getUserById: {
    type: User,
    args: {
      id: {type: new GraphQLNonNull(GraphQLID)}
    },
    async resolve(source, args, authToken) {
      isAdminOrSelf(authToken, args);
      const user = await r.table('users').get(args.id);
      if (!user) {
        throw errorObj({_error: 'User not found'});
      }
      return user;
    }
  },
  login: {
    type: UserWithAuthToken,
    args: {
      email: {type: new GraphQLNonNull(GraphQLEmailType)},
      password: {type: new GraphQLNonNull(GraphQLPasswordType)}
    },
    async resolve(source, args) {
      const {email, password} = args;
      const [user, [token, cargo]] = await Promise.all([getUserByEmail(email), auths.login(email, password)]);
      if (!token) {
        console.log('WARN - login Missing Token'); // TODO: nuke it
      }
      if (!user) {
        throw errorObj({_error: 'User not found'});
      }
      if (!user.handle && !cargo.handle) {
        console.log('WARN - login Missing Handle');
      }
      const {strategies} = user;
      const hashedPassword = strategies && strategies.local && strategies.local.password;
      if (!hashedPassword) {
        throw errorObj({_error: getAltLoginMessage(strategies)});
      }
      const isCorrectPass = await compare(password, hashedPassword);
      if (isCorrectPass) {
        const authToken = signJwt({token, ...user, ...cargo});
        return {authToken, user: {...user, ...cargo}};
      }
      throw errorObj({_error: 'Login failed', password: 'Incorrect password'});
    }
  },
  loginAuthToken: {
    type: User,
    async resolve(source, args, authToken) {
      const {id, token, ...tokenData} = authToken;
      if (!id || !token) {
        throw errorObj({_error: 'Invalid authentication Token'});
      }
      const user = await r.table('users').get(id);
      if (!user) {
        throw errorObj({_error: 'User not found'});
      }
      return {...user, ...tokenData};
    }
  }
};

