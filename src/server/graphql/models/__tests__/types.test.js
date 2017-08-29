import test from 'ava';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql';

import {
  // GraphQLHandleType,
  // GraphQLEmailType,
  // GraphQLPasswordType,
  // GraphQLTitleType,
  // GraphQLSummaryType,
  // GraphQLDetailsType,
  // GraphQLResponseType,
  // GraphQLURLType,
  GraphQLDateType
} from '../types';

// Note that the allowable Date range is smaller than the range allowed by
// Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER which would
// tolerate ±(2^53 - 1) as an IEEE 754 double-precision floating point

test('GraphQLDateType:serialize', t => {
  const maxStr = GraphQLDateType.serialize('+275760-09-13T00:00:00.000Z');
  t.is(maxStr, '+275760-09-13T00:00:00.000Z');

  const maxInt = GraphQLDateType.serialize(8640000000000000);
  t.is(maxInt, '+275760-09-13T00:00:00.000Z');

  const maxOverflowStr = GraphQLDateType.serialize('+275760-09-13T00:00:00.001Z');
  t.is(maxOverflowStr, null);

  const maxOverflowInt = GraphQLDateType.serialize(8640000000000001);
  t.is(maxOverflowInt, null);

  const minStr = GraphQLDateType.serialize('-271821-04-20T00:00:00.000Z');
  t.is(minStr, '-271821-04-20T00:00:00.000Z');

  const minInt = GraphQLDateType.serialize(-8640000000000000);
  t.is(minInt, '-271821-04-20T00:00:00.000Z');

  const minOverflowStr = GraphQLDateType.serialize('-271821-04-19T23:59:59.999Z');
  t.is(minOverflowStr, null);

  const minOverflowInt = GraphQLDateType.serialize(-8640000000000001);
  t.is(minOverflowInt, null);
});

test('GraphQLDateType:parseLiteral success', async t => {
  const epoch = new Date(0);

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        timestamp: {
          type: GraphQLDateType,
          resolve: () => epoch
        }
      }
    })
  });

  const {data: {timestamp}} = await graphql(schema, `{ timestamp }`);
  t.is(timestamp, '1970-01-01T00:00:00.000Z');
});

test('GraphQLDateType:parseLiteral non-UTC ISO 8601', async t => {
  const local = '2016-05-09T08:25:21.066-0400';

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        timestamp: {
          type: GraphQLDateType,
          resolve: () => local
        }
      }
    })
  });

  const {data: {timestamp}} = await graphql(schema, `{ timestamp }`);
  t.is(timestamp, null);
});

test('GraphQLDateType:parseLiteral overflow', async t => {
  const overflow = '+275760-09-13T00:00:00.001Z';

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        timestamp: {
          type: GraphQLDateType,
          resolve: () => overflow
        }
      }
    })
  });

  const {data: {timestamp}} = await graphql(schema, `{ timestamp }`);
  t.is(timestamp, null);
});
