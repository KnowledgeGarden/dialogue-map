import {GraphQLNonNull, GraphQLBoolean, GraphQLString} from 'graphql';
import promisify from 'es6-promisify';
import bcrypt from 'bcrypt';
import uuid from 'node-uuid';
import validateSecretToken from '../../../../universal/utils/validateSecretToken';
import {auths} from '../../../backside/AuthDriver';
import {users} from '../../../backside/UserDriver';
import r from '../../../database/rethinkdriver';
import {isLoggedIn} from '../authorization';
import {GraphQLHandleType, GraphQLEmailType, GraphQLPasswordType} from '../types';
import {errorObj} from '../utils';
import {UserWithAuthToken} from './userSchema';
import {getUserByEmail, signJwt, getAltLoginMessage, makeSecretToken} from './helpers';

const compare = promisify(bcrypt.compare);
const hash = promisify(bcrypt.hash);

export default {
  createUser: {
    type: UserWithAuthToken,
    args: {
      name: {type: new GraphQLNonNull(GraphQLString)},
      handle: {type: new GraphQLNonNull(GraphQLHandleType)},
      email: {type: new GraphQLNonNull(GraphQLEmailType)},
      password: {type: new GraphQLNonNull(GraphQLPasswordType)}
    },
    async resolve(source, {name, handle, email, password}) {
      const [validHandle, validEmail, token, user] = await Promise.all([
        auths.isHandleAvailable(handle),
        auths.isEmailAvailable(email),
        auths.login(email, password),
        getUserByEmail(email)
      ]);
      if (!token) {
        console.log('WARN - Missing Token'); // TODO: nuke it
      }
      if (user && password) {
        const {strategies} = user;
        const hashedPassword = strategies && strategies.local && strategies.local.password;
        if (!hashedPassword) {
          throw errorObj({_error: getAltLoginMessage(strategies)});
        }
        const isCorrectPass = await compare(password, hashedPassword);
        if (isCorrectPass) {
          const authToken = signJwt({id: user.id, token, handle});
          return {authToken, user};
        }
        throw errorObj({_error: 'Cannot create account', password: 'Incorrect password for that email address'});
      } else if (validHandle === false) {
        throw errorObj({_error: 'Cannot create account', handle: 'That username has already been taken'});
      } else if (validEmail === false) {
        throw errorObj({_error: 'Cannot create account', email: 'That email has already been taken'});
      } else {
        // production should use 12+, but it's slow for dev
        const [newHashedPassword, newToken] = await Promise.all([hash(password, 10), users.register({fullName: name, handle, email, password})]);
        if (!newToken) {
          console.log('WARN - Missing Token'); // TODO: nuke it
        }
        const id = uuid.v4();
        // must verify email within 1 day
        const verifiedEmailToken = makeSecretToken(id, 60 * 24);
        const userDoc = {
          id,
          name,
          handle,
          email,
          createdAt: new Date(),
          strategies: {
            local: {
              isVerified: false,
              password: newHashedPassword,
              verifiedEmailToken
            }
          }
        };
        const newUser = await r.table('users').insert(userDoc);
        if (!newUser.inserted) {
          throw errorObj({_error: 'Could not create account, please try again'});
        }
        // TODO send email with verifiedEmailToken via mailgun or whatever
        // console.log('Verify url:', `http://localhost:3000/verify-email/${verifiedEmailToken}`);
        const authToken = signJwt({id, token: newToken, handle});
        return {user: userDoc, authToken};
      }
    }
  },
  emailPasswordReset: {
    type: GraphQLBoolean,
    args: {
      email: {type: new GraphQLNonNull(GraphQLEmailType)}
    },
    async resolve(source, {email}) {
      const user = await getUserByEmail(email);
      if (!user) {
        throw errorObj({_error: 'User not found'});
      }
      const resetToken = makeSecretToken(user.id, 60 * 24);
      const result = await r.table('users').get(user.id).update({strategies: {local: {resetToken}}});
      if (!result.replaced) {
        throw errorObj({_error: 'Could not find or update user'});
      }
      console.log('Reset url:', `http://localhost:3000/login/reset-password/${resetToken}`);
      return true;
    }
  },
  resetPassword: {
    type: UserWithAuthToken,
    args: {
      password: {type: new GraphQLNonNull(GraphQLPasswordType)}
    },
    async resolve(source, {password}, authToken, {rootValue: {resetToken}}) {
      const resetTokenObject = validateSecretToken(resetToken);
      if (resetTokenObject._error) {
        throw errorObj(resetTokenObject);
      }
      const user = await r.table('users').get(resetTokenObject.id);
      if (!user) {
        throw errorObj({_error: 'User not found'});
      }
      const userResetToken = user.strategies && user.strategies.local && user.strategies.local.resetToken;
      if (!userResetToken || userResetToken !== resetToken) {
        throw errorObj({_error: 'Unauthorized'});
      }
      const newHashedPassword = await hash(password, 10);
      const updates = {
        strategies: {
          local: {
            password: newHashedPassword,
            resetToken: null
          }
        }
      };
      const result = await r.table('users').get(user.id).update(updates, {returnChanges: true});
      if (!result.replaced) {
        throw errorObj({_error: 'Could not find or update user'});
      }
      const newUser = result.changes[0].new_val;
      const newAuthToken = signJwt(newUser);
      return {newAuthToken, user: newUser};
    }
  },
  resendVerificationEmail: {
    type: GraphQLBoolean,
    async resolve(source, args, authToken) {
      isLoggedIn(authToken);
      const {id} = authToken;
      const user = await r.table('users').get(id);
      if (!user) {
        throw errorObj({_error: 'User not found'});
      }
      if (user.strategies && user.strategies.local && user.strategies.local.isVerified) {
        throw errorObj({_error: 'Email already verified'});
      }
      const verifiedEmailToken = makeSecretToken(id, 60 * 24);
      const result = await r.table('users').get(id).update({strategies: {local: {verifiedEmailToken}}});
      if (!result.replaced) {
        throw errorObj({_error: 'Could not find or update user'});
      }
      // TODO send email with new verifiedEmailToken via mailgun or whatever
      console.log('Verified url:', `http://localhost:3000/login/verify-email/${verifiedEmailToken}`);
      return true;
    }
  },
  verifyEmail: {
    type: UserWithAuthToken,
    async resolve(source, args, authToken, {rootValue: {verifiedEmailToken}}) {
      const verifiedEmailTokenObj = validateSecretToken(verifiedEmailToken);
      if (verifiedEmailTokenObj._error) {
        throw errorObj(verifiedEmailTokenObj);
      }
      const user = await r.table('users').get(verifiedEmailTokenObj.id);
      if (!user) {
        throw errorObj({_error: 'User not found'});
      }
      const localStrategy = user.strategies && user.strategies.local || {};
      if (localStrategy && localStrategy.isVerified) {
        throw errorObj({_error: 'Email already verified'});
      }
      if (localStrategy && localStrategy.verifiedEmailToken !== verifiedEmailToken) {
        throw errorObj({_error: 'Unauthorized'});
      }
      const updates = {
        strategies: {
          local: {
            isVerified: true,
            verifiedEmailToken: null
          }
        }
      };
      const result = await r.table('users').get(verifiedEmailTokenObj.id).update(updates, {returnChanges: true});
      if (!result.replaced) {
        throw errorObj({_error: 'Could not find or update user'});
      }
      return {
        user: result.changes[0].new_val,
        authToken: signJwt(verifiedEmailTokenObj)
      };
    }
  }
};
