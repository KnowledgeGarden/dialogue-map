import test from 'ava';

import nock from 'nock';
nock.disableNetConnect();
// nock.recorder.rec(); // uncommenting enables real network connections

import {users} from '../UserDriver';

import {DEFAULT_URL} from '../backside.config.js';
const BACKSIDE_URL = process.env.BACKSIDE_URL || DEFAULT_URL;

// this does not check invited status before registering
// this does not check if user exists before registering
// this succeeds even if h2 insert fails!
test('register() successfully registers a user', async t => {
  nock(BACKSIDE_URL)
    .post('/user/%7B%22verb%22%3A%22NewUser%22%2C%22uFullName%22%3A%22Alec%20Wenzowski%22%2C%22uName%22%3A%22wenzowski%22%2C%22uEmail%22%3A%22alec%40wenzowski.com%22%2C%22uPwd%22%3A%22Y2hhbmdlbWVub3c%3D%22%2C%22uAvatar%22%3A%22https%3A%2F%2Favatars2.githubusercontent.com%2Fu%2F597920%22%2C%22uGeoloc%22%3A%2243.65201%7C-79.43399%22%2C%22uHomepage%22%3A%22https%3A%2F%2Falec.wenzowski.com%22%7D')
    .reply(200, {
      rMsg: 'ok',
      rToken: '9e7fd202-980b-46c8-8d62-4bc2d7a43675'
    });
  const token = await users.register({
    fullName: 'Alec Wenzowski',
    handle: 'wenzowski',
    email: 'alec@wenzowski.com',
    password: 'changemenow',
    avatar: 'https://avatars2.githubusercontent.com/u/597920',
    geoLocation: {
      latitude: '43.65201',
      longitude: '-79.43399'
    },
    homepage: 'https://alec.wenzowski.com'
  });
  t.is(token, '9e7fd202-980b-46c8-8d62-4bc2d7a43675');
});

test('list() fetches an array of users', async t => {
  nock(BACKSIDE_URL)
    .get('/user/%7B%22verb%22%3A%22ListUsers%22%2C%22from%22%3A%220%22%2C%22count%22%3A%221%22%7D')
    .reply(200, {
      rMsg: 'ok',
      rToken: '',
      cargo: [
        {
          uGeoloc: '',
          uEmail: 'TestUser@foo.org',
          uHomepage: '',
          uName: 'defaultadmin',
          uFullName: 'Default Admin',
          uRole: 'rar, ror',
          uAvatar: ''
        }
      ]
    });
  const cargo = await users.list({from: 0, count: 1});
  t.deepEqual(cargo, [
    {
      uGeoloc: '',
      uEmail: 'TestUser@foo.org',
      uHomepage: '',
      uName: 'defaultadmin',
      uFullName: 'Default Admin',
      uRole: 'rar, ror',
      uAvatar: ''
    }
  ]);
});

test('list() throws errors when `from` is not an integer', t => {
  t.throws(users.list({from: null}), 'query attribute `from` must be an integer');
});

test('list() throws errors when `count` is not an integer', t => {
  t.throws(users.list({count: null}), 'query attribute `from` must be an integer');
});

test.todo('fetchByEmail()');

test('remove() idempotently removes a user by handle', async t => {
  nock(BACKSIDE_URL)
    .post('/user/%7B%22verb%22%3A%22RemUser%22%2C%22uName%22%3A%22wenzowski%22%7D')
    .reply(200, {});
  const isDeleted = await users.remove('wenzowski');
  t.true(isDeleted);
});

test.todo('updateRole()');
test.todo('updateEmail()');
test.todo('updatePassword()');
test.todo('updateData()');
