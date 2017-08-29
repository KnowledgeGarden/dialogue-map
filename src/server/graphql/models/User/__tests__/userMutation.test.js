import test from 'ava';
import promisify from 'es6-promisify';
import bcrypt from 'bcrypt';
import {graphql} from 'graphql';
import sinon from 'sinon';
import {auths} from '../../../../backside/AuthDriver';
import {users} from '../../../../backside/UserDriver';
import Schema from '../../../rootSchema';
import r from '../../../../database/rethinkdriver';
import {getUserByEmail, getUserByHandle} from '../helpers.js';

const compare = promisify(bcrypt.compare);
const user = `
{
  id,
  name,
  handle,
  email,
  createdAt,
  updatedAt,
  strategies {
    local {
      isVerified,
      password,
      verifiedEmailToken,
      resetToken
    }
  }
}`;

test.before(() => {
  sinon.stub(auths, 'isHandleAvailable', () => true);
  sinon.stub(auths, 'isEmailAvailable', () => true);
  sinon.stub(auths, 'login', () => ['3c86d45f-b55f-4829-bf37-686bee767d63', {}]);
  sinon.stub(users, 'register', () => 'e05bddbd-aac5-4ca2-af35-a27857f9c2cb');
});

const userWithAuthToken = `
{
  user ${user},
  authToken
}`;

test.todo('isHandleAvailable => false');
test.todo('isEmailAvailable => false');
test.todo('login => ["", {}]');

test('createUser:hashedPassword', async t => {
  const query = `
  mutation {
    newUser: createUser(
      name: "Hashed Password",
      handle: "cu:hpw",
      email: "createUser:hashedPassword@createUser:hashedPassword",
      password: "a123123"
    )
    ${userWithAuthToken}
  }`;
  const actual = await graphql(Schema, query);
  t.falsy(actual.errors, (actual.errors || []).map(error => error.stack));
  const {user: {id}} = actual.data.newUser;
  const user = await r.table('users').get(id);
  t.true(await compare('a123123', user.strategies.local.password));
});

test('createUser:caseInsensitive', async t => {
  const query = `
  mutation {
    newUser: createUser(
      name: "Case Insensitive",
      handle: "cu:cINS",
      email: "createUser:caseInsensitive@createUser:caseInsensitive",
      password: "a123123"
    )
    ${userWithAuthToken}
  }`;
  const actual = await graphql(Schema, query);
  t.falsy(actual.errors, (actual.errors || []).map(error => error.stack));
  // const {user: {id}} = actual.data.newUser;
  const userByEmail = await getUserByEmail('createuser:caseinsensitive@createuser:caseinsensitive');
  t.is(userByEmail.email, 'createUser:caseInsensitive@createUser:caseInsensitive');
  const userByHandle = await getUserByHandle('cu:cins');
  t.is(userByHandle.handle, 'cu:cINS');
});

test('createUser:success', async t => {
  const query = `
  mutation {
    newUser: createUser(
      name: "Success",
      handle: "cu:success",
      email: "createUser:success@createUser:success",
      password: "a123123"
    )
    ${userWithAuthToken}
  }`;
  const actual = await graphql(Schema, query);
  t.falsy(actual.errors, (actual.errors || []).map(error => error.stack));
  const {user: {id, createdAt}, authToken} = actual.data.newUser;
  const expected = {
    data: {
      newUser: {
        user: {
          id,
          name: 'Success',
          handle: 'cu:success',
          email: 'createUser:success@createUser:success',
          createdAt,
          updatedAt: null,
          strategies: {
            local: {
              isVerified: false,
              password: null,
              verifiedEmailToken: null,
              resetToken: null
            }
          }
        },
        authToken
      }
    }
  };
  t.true(new Date(createdAt) <= new Date());
  t.true(typeof id === 'string');
  t.truthy(authToken);
  t.deepEqual(actual, expected);
});

test('createUser:alreadyexists', async t => {
  // treat it like a login
  const query = `
  mutation {
    newUser: createUser(
      name: "Already Exists",
      handle: "cu:ae",
      email: "createUser:alreadyexists@createUser:alreadyexists",
      password: "a123123"
    )
    ${userWithAuthToken}
  }`;
  const user1 = await graphql(Schema, query);
  const actual = await graphql(Schema, query);
  t.falsy(actual.errors, (actual.errors || []).map(error => error.stack));
  const {user: {name, handle, email}} = user1.data.newUser;
  const {user: {id, createdAt}, authToken} = actual.data.newUser;
  const expected = {
    data: {
      newUser: {
        user: {
          id,
          name,
          handle,
          email,
          createdAt,
          updatedAt: null,
          strategies: {
            local: {
              isVerified: false,
              password: null,
              verifiedEmailToken: null,
              resetToken: null
            }
          }
        },
        authToken
      }
    }
  };
  t.true(new Date(createdAt) <= new Date());
  t.true(typeof id === 'string');
  t.truthy(authToken);
  t.deepEqual(actual, expected);
});

test('createUser:emailexistsdifferentpass', async t => {
  const query = `
  mutation {
    newUser: createUser(
      name: "Email Exists with Different Password",
      handle: "cu:eedf",
      email: "createUser:emailexistsdifferentpass@createUser:emailexistsdifferentpass",
      password: "a123123"
    )
    ${userWithAuthToken}
  }`;
  await graphql(Schema, query);
  const actual = await graphql(Schema, query.replace('a123123', 'b123123'));
  const expected = {
    data: {
      newUser: null
    },
    errors: [
      {
        message: '{"_error":"Cannot create account","password":"Incorrect password for that email address"}',
        originalError: {}
      }
    ]
  };
  t.is(actual.errors[0].message, expected.errors[0].message);
});

test('emailPasswordReset:success', async t => {
  const createQuery = `
  mutation {
    newUser: createUser(
      name: "Password Reset",
      handle: "epw:success",
      email: "emailPasswordReset:success@emailPasswordReset:success",
      password: "a123123"
    )
    ${userWithAuthToken}
  }`;
  const query = `
  mutation {
    newUser: emailPasswordReset(
      email: "emailPasswordReset:success@emailPasswordReset:success"
    )
  }`;
  await graphql(Schema, createQuery);
  await graphql(Schema, query);
  const dbUser = await getUserByEmail('emailpasswordreset:success@emailpasswordreset:success');
  const {resetToken} = dbUser.strategies.local;
  t.truthy(resetToken);
});

test('emailPasswordReset:userdoesntexist', async t => {
  const query = `
  mutation {
    newUser: emailPasswordReset(
      email: "emailPasswordReset:userdoesntexist@emailPasswordReset:userdoesntexist"
    )
  }`;
  const result = await graphql(Schema, query);
  t.is(result.errors[0].message, '{"_error":"User not found"}');
});

test.after(() => {
  auths.isHandleAvailable.restore();
  auths.isEmailAvailable.restore();
  auths.login.restore();
  users.register.restore();
});
