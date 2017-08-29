import test from 'ava';

import nock from 'nock';
nock.disableNetConnect();
// nock.recorder.rec(); // uncommenting enables real network connections

import {invitations} from '../InvitationDriver';

import {DEFAULT_URL} from '../backside.config.js';
const BACKSIDE_URL = process.env.BACKSIDE_URL || DEFAULT_URL;

test('invite() successfully invites a user', async t => {
  nock(BACKSIDE_URL)
    .get('/admin/%7B%22verb%22%3A%22NewInvite%22%2C%22uEmail%22%3A%22brandnew%40example.com%22%7D')
    .reply(200, {
      rMsg: 'ok',
      rToken: ''
    });
  const success = await invitations.invite('brandnew@example.com');
  t.true(success);
});

test('invite() swallows 500 error indicating user has already been invited', async t => {
  nock(BACKSIDE_URL)
    .get('/admin/%7B%22verb%22:%22NewInvite%22,%22uEmail%22:%22alreadyinvited@example.com%22%7D')
    .reply(500, 'javax.servlet.ServletException: java.lang.IllegalArgumentException');
  const success = await invitations.invite('alreadyinvited@example.com');
  t.false(success);
});

// TODO(wenzowski): check that a consistent sort is applied so paging works correctly
test('list() fetches an array of email addresses that have been invited', async t => {
  nock(BACKSIDE_URL)
    .get('/admin/%7B%22verb%22%3A%22ListInvites%22%2C%22from%22%3A%220%22%2C%22count%22%3A%221%22%7D')
    .reply(200, {
      rMsg: 'ok',
      rToken: '',
      cargo: [
        'invited@example.com'
      ]
    });
  const cargo = await invitations.list({from: 0, count: 1});
  t.deepEqual(cargo, [
    'invited@example.com'
  ]);
});

test('list() throws errors when `from` is not an integer', t => {
  t.throws(invitations.list({from: null}), 'query attribute `from` must be an integer');
});

test('list() throws errors when `count` is not an integer', t => {
  t.throws(invitations.list({count: null}), 'query attribute `from` must be an integer');
});

test('isInvited() returns true when an invitation exists', async t => {
  nock(BACKSIDE_URL)
    .get('/admin/%7B%22verb%22%3A%22ExistsInvite%22%2C%22uEmail%22%3A%22inviteduser%40example.com%22%7D')
    .reply(200, {rMsg: 'ok'});
  const isUserInvited = await invitations.isInvited('inviteduser@example.com');
  t.true(isUserInvited);
});

test('isInvited() returns false when an invitation does not exist', async t => {
  nock(BACKSIDE_URL)
    .get('/admin/%7B%22verb%22%3A%22ExistsInvite%22%2C%22uEmail%22%3A%22notinviteduser%40example.com%22%7D')
    .reply(200, {rMsg: 'not found'});
  const isUserInvited = await invitations.isInvited('notinviteduser@example.com');
  t.false(isUserInvited);
});

test('uninvite() idempotently removes a user invite', async t => {
  nock(BACKSIDE_URL)
    .post('/admin/%7B%22verb%22%3A%22RemoveInvite%22%2C%22uEmail%22%3A%22possiblyinviteduser%40example.com%22%7D')
    .reply(200, {rMsg: 'ok'});
  const success = await invitations.uninvite('possiblyinviteduser@example.com');
  t.true(success);
});
