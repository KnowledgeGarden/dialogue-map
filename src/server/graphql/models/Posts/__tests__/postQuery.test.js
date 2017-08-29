import test from 'ava';
import sinon from 'sinon';
import {graphql} from 'graphql';

import Schema from '../../../rootSchema';
import {topicMap} from '../../../../backside/TopicMapDriver';
import {stubFetchTopicCargo} from '../../../../backside/__tests__/stubs/topicMapCargo';

test('getPostById', async t => {
  sinon.stub(topicMap, 'fetchTopic', () => stubFetchTopicCargo);

  const actual = await graphql(Schema, `{
    getPostById(id: "66676eab-0445-4233-b733-b60db0093852") {
      id,
      language,
      title,
      details,
      handle,
      createdAt,
      updatedAt
    }
  }`);

  (actual.errors || []).forEach(message => t.deepEqual(message, ''));

  const {
    id, language, title, details, handle, createdAt, updatedAt
  } = stubFetchTopicCargo;

  t.deepEqual(actual, {
    data: {
      getPostById: {
        id,
        language,
        title,
        details,
        handle,
        createdAt,
        updatedAt
      }
    }
  });
});
