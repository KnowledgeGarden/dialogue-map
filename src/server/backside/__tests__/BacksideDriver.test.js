import test from 'ava';

import nock from 'nock';
nock.disableNetConnect();
// nock.recorder.rec(); // uncommenting enables real network connections

import BacksideDriver, {extractIcon, isPrivate} from '../BacksideDriver';
import config from '../backside.config';

import {parseBacksideUrl, DEFAULT_URL} from '../backside.config.js';
const BACKSIDE_URL = process.env.BACKSIDE_URL || DEFAULT_URL;

test('constructor() requires a host', t => {
  t.throws(() => new BacksideDriver({}), 'host is required');
});

test('constructor() host cannot be an empty string', t => {
  t.throws(() => new BacksideDriver({host: ''}), 'host is required');
});

test('constructor() requires host to be a string', t => {
  t.throws(() => new BacksideDriver({host: 123}), 'host must be a string');
});

test('constructor() defaults to http', t => {
  const bs = new BacksideDriver({host: 'localhost'});
  t.is(bs.host, 'localhost');
  t.is(bs.protocol, 'http');
  t.is(bs.port, 80);
});

test('constructor() defaults to correct https port', t => {
  const bs = new BacksideDriver({host: 'example.com', protocol: 'https'});
  t.is(bs.host, 'example.com');
  t.is(bs.protocol, 'https');
  t.is(bs.port, 443);
});

test('constructor() requires a supported protocol', t => {
  t.throws(
    () => new BacksideDriver({host: 'localhost', protocol: 'spdy'}),
    '\'spdy\' is not a supported protocol'
  );
});

test('get() throws errors if response code is not 200', t => {
  nock(BACKSIDE_URL).get('/fake/%7B%22verb%22%3A%22DoesNotExist%22%7D').reply(404);
  const bs = new BacksideDriver(config);
  const endpoint = bs.endpoint('/fake/', {verb: 'DoesNotExist'});
  t.throws(bs.get(endpoint), 'Backside responded with \'404\'.');
});

test('get() throws errors when response is not json', t => {
  nock(BACKSIDE_URL).get('/fake/%7B%22verb%22%3A%22DoesNotExist%22%7D').reply(200, '<h1>Wrong!</h1>');
  const bs = new BacksideDriver(config);
  const endpoint = bs.endpoint('/fake/', {verb: 'DoesNotExist'});
  t.throws(bs.get(endpoint), 'Backside did not respond with json body. Got: <h1>Wrong!</h1>');
});

// TODO(wenzowski): find out if this could ever happen
test('getCargo() returns empty object if cargo is missing', async t => {
  nock(BACKSIDE_URL).get('/fake/%7B%22verb%22%3A%22DoesNotExist%22%7D').reply(200, {rMsg: 'ok'});
  const bs = new BacksideDriver(config);
  const cargo = await bs.getCargo('/fake/', {verb: 'DoesNotExist'});
  t.deepEqual(cargo, {});
});

test('getCargo() parses a json response', async t => {
  nock(BACKSIDE_URL)
    .get('/tm/%7B%22verb%22%3A%22GetTopic%22%2C%22lox%22%3A%2266676eab-0445-4233-b733-b60db0093852%22%7D')
    .reply(200, {
      rMsg: 'ok',
      cargo: {
        lox: '66676eab-0445-4233-b733-b60db0093852'
      }
    });
  const bs = new BacksideDriver(config);
  const cargo = await bs.getCargo('/tm/', {
    verb: 'GetTopic',
    lox: '66676eab-0445-4233-b733-b60db0093852'
  });
  t.deepEqual(cargo.lox, '66676eab-0445-4233-b733-b60db0093852');
});

test('post() throws errors if response code is not 200', t => {
  nock(BACKSIDE_URL).post('/fake/%7B%22verb%22%3A%22DoesNotExist%22%7D').reply(404);
  const bs = new BacksideDriver(config);
  const endpoint = bs.endpoint('/fake/', {verb: 'DoesNotExist'});
  t.throws(bs.post(endpoint), 'Backside responded with \'404\'.');
});

test('post() throws errors when response is not json', t => {
  nock(BACKSIDE_URL).post('/fake/%7B%22verb%22%3A%22DoesNotExist%22%7D').reply(200, '<h1>Wrong!</h1>');
  const bs = new BacksideDriver(config);
  const endpoint = bs.endpoint('/fake/', {verb: 'DoesNotExist'});
  t.throws(bs.post(endpoint), 'Backside did not respond with json body. Got: <h1>Wrong!</h1>');
});

test('postCargo() returns the created object', async t => {
  nock(BACKSIDE_URL, {encodedQueryParams: true})
    .post('/tm/%7B%22verb%22%3A%22NewInstance%22%2C%22uName%22%3A%22defaultadmin%22%2C%22sToken%22%3A%222b659e8d-443a-42d6-ab08-298545c0639e%22%2C%22cargo%22%3A%7B%22Lang%22%3A%22en%22%2C%22label%22%3A%22test%22%2C%22details%22%3A%22%22%2C%22isPrv%22%3A%22F%22%2C%22inOf%22%3A%22BlogNodeType%22%7D%7D')
    .reply(200, {
      rMsg: 'ok',
      cargo: {
        trCl: ['TypeType', 'ClassType', 'NodeType', 'BlogNodeType', 'BlogNodeType', 'BlogNodeType'],
        lox: '3ede9b7f-76bf-493b-b362-0a38720036fb',
        label: ['test']
      }
    },
    {
      'content-type': 'application/json; charset=UTF-8'
    });
  const bs = new BacksideDriver(config);
  const cargo = await bs.postCargo('/tm/', {
    verb: 'NewInstance',
    uName: 'defaultadmin',
    sToken: '2b659e8d-443a-42d6-ab08-298545c0639e',
    cargo: {
      Lang: 'en',
      label: 'test',
      details: '',
      isPrv: 'F',
      inOf: 'BlogNodeType'
    }
  });
  t.truthy(cargo.lox);
  t.deepEqual(cargo.label, ['test']);
  t.deepEqual(cargo.trCl, ['TypeType', 'ClassType', 'NodeType', 'BlogNodeType', 'BlogNodeType', 'BlogNodeType']);
});

test('baseURL() includes protocol, host, and port', t => {
  const bs = new BacksideDriver({host: 'example.com', protocol: 'https', port: 443});
  t.is(bs.baseURL(), 'https://example.com:443');
});

// TODO(wenzowski): check if `request` requires url encoding
test('authURL() injects email and password', t => {
  const bs = new BacksideDriver({host: 'example.com', protocol: 'https', port: 443});
  t.is(
    bs.authURL('test@example.com', 'plaintext password'),
    'https://test@example.com:plaintext password@example.com:443'
  );
});

test('extractIcon() with conflicting icons chooses the first icon', t => {
  const lIco = '/images/publication.png';
  const sIco = '/images/tag_sm.png';
  const icon = extractIcon(sIco, lIco);
  t.is(icon, 'publication');
});

test('extractIcon() with null lIco chooses the sIco icon', t => {
  const lIco = null;
  const sIco = '/images/tag_sm.png';
  const icon = extractIcon(sIco, lIco);
  t.is(icon, 'tag');
});

test('extractIcon() with null sIco chooses the lIco icon', t => {
  const lIco = '/images/publication.png';
  const sIco = null;
  const icon = extractIcon(sIco, lIco);
  t.is(icon, 'publication');
});

test('isPrivate() parses "T"', t => {
  const isPrv = 'T';
  t.true(isPrivate(isPrv));
});

test('isPrivate() parses "F"', t => {
  const isPrv = 'f';
  t.false(isPrivate(isPrv));
});

test('isPrivate() parses "true"', t => {
  const isPrv = 'true';
  t.true(isPrivate(isPrv));
});

test('isPrivate() parses false', t => {
  const isPrv = false;
  t.false(isPrivate(isPrv));
});

test('isPrivate() default is null', t => {
  const isPrv = 'yucky';
  t.is(isPrivate(isPrv), null);
});

test('parseBacksideUrl()', t => {
  const {protocol, host, port} = parseBacksideUrl('https://example.com:443');
  t.is(protocol, 'https');
  t.is(host, 'example.com');
  t.is(port, '443');
});
