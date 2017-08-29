import test from 'ava';

import nock from 'nock';
nock.disableNetConnect();
// nock.recorder.rec(); // uncommenting enables real network connections

import {topicMap} from '../TopicMapDriver';
import {deepEqual} from './helpers';

import {DEFAULT_URL} from '../backside.config.js';
const BACKSIDE_URL = process.env.BACKSIDE_URL || DEFAULT_URL;

import {mockFetchTopicSuccess, mockAddTopicSuccess} from './mocks/topicMapResponse';
import {stubFetchTopicCargo, stubAddTopicCargo} from './stubs/topicMapCargo';

const authToken = {
  token: '36d1ed94-f4ef-4c63-abd0-33cf65a3a3d9',
  handle: 'defaultadmin'
};

test.todo('fullTextSearch()');
test.todo('fullTextPhraseSearch()');

test('fetchTopic()', async t => {
  nock(BACKSIDE_URL)
    .get('/tm/%7B%22verb%22%3A%22GetTopic%22%2C%22lox%22%3A%2266676eab-0445-4233-b733-b60db0093852%22%7D')
    .reply(200, mockFetchTopicSuccess);
  const cargo = await topicMap.fetchTopic('66676eab-0445-4233-b733-b60db0093852');
  deepEqual(t, cargo, stubFetchTopicCargo);
});

test('addTopic()', async t => {
  nock(BACKSIDE_URL)
    .post('/tm/%7B%22verb%22%3A%22NewInstance%22%2C%22sToken%22%3A%2236d1ed94-f4ef-4c63-abd0-33cf65a3a3d9%22%2C%22uName%22%3A%22defaultadmin%22%2C%22cargo%22%3A%7B%22uName%22%3A%22defaultadmin%22%2C%22Lang%22%3A%22en%22%2C%22label%22%3A%22titleitagain%3F%22%2C%22details%22%3A%22descriptorize!%22%2C%22lIco%22%3A%22%2Fimages%2Fpublication.png%22%2C%22sIco%22%3A%22%2Fimages%2Fpublication_sm.png%22%2C%22isPrv%22%3A%22F%22%2C%22inOf%22%3A%22BlogNodeType%22%7D%7D')
    .reply(200, mockAddTopicSuccess);
  const cargo = await topicMap.addTopic(authToken, {
    language: 'en',
    label: 'titleitagain?',
    details: 'descriptorize!',
    icon: 'publication',
    isPrivate: false,
    instanceOf: 'BlogNodeType'
  });
  deepEqual(t, cargo, stubAddTopicCargo);
});

test.todo('removeTopic()');
test.todo('newTopicInstance()');
test.todo('newTopicSubclass()');
test.todo('listTopicInstances()');
test.todo('listTopicSubclasses()');

test.todo('addConversationNode()');
test.todo('addFeaturesToTopic()');
test.todo('loadTree()');
test.todo('listTreeChildNodes()');
test.todo('fetchTopicByUrl()');
test.todo('addPivot()');
test.todo('addRelation()');
test.todo('addChildNode()');

test('attachTag()', async t => {
  nock(BACKSIDE_URL)
    .post('/tm/%7B%22verb%22%3A%22FindProcessTag%22%2C%22sToken%22%3A%2236d1ed94-f4ef-4c63-abd0-33cf65a3a3d9%22%2C%22uName%22%3A%22defaultadmin%22%2C%22lox%22%3A%22e6472fce-3c77-4d4b-b8ed-d7882ebc0bad%22%2C%22ListProperty%22%3A%5B%22tag1%22%2C%22tag2%22%5D%2C%22Lang%22%3A%22en%22%7D')
    .reply(200, {rMsg: 'ok', rToken: ''});
  const cargo = await topicMap.attachTag(authToken, {
    id: 'e6472fce-3c77-4d4b-b8ed-d7882ebc0bad',
    tags: ['tag1', 'tag2'],
    language: 'en'
  });
  deepEqual(t, cargo, {});
});

test.todo('attachBookmark()');
