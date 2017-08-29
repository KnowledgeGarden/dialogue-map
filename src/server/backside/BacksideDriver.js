import promisify from 'es6-promisify';

import request from 'request';
const get = promisify(request.get, {multiArgs: true});
const post = promisify(request.post, {multiArgs: true});

import config from './backside.config';
import {
  StatusCodeError,
  ParseError,
  ResponseMessageError
} from './BacksideErrors';

export default class BacksideDriver {
  constructor({host, protocol = 'http', port}) {
    this.host = ensureHost(host);
    this.port = ensurePort(port, protocol);
    this.protocol = validateProtocol(protocol);
  }

  async getCargo(path, query) {
    const endpoint = this.endpoint(path, query);
    const body = await this.get(endpoint);
    if (body.rMsg !== 'ok') throw new ResponseMessageError(body.rMsg);
    return body.cargo || {};
  }

  async postCargo(path, query) {
    const endpoint = this.endpoint(path, query);
    const body = await this.post(endpoint);
    if (body.rMsg !== 'ok') throw new ResponseMessageError(body.rMsg);
    return body.cargo || {};
  }

  async get(endpoint) {
    if (!endpoint || !endpoint.url) throw new ReferenceError('Missing endpoint url');
    const [res, body] = await get(endpoint);
    if (res.statusCode !== 200) throw new StatusCodeError(res.statusCode, body);
    if (typeof body !== 'object') throw new ParseError(body);
    return body;
  }

  async post(endpoint) {
    if (!endpoint || !endpoint.url) throw new ReferenceError('Missing endpoint url');
    const [res, body] = await post(endpoint);
    if (res.statusCode !== 200) throw new StatusCodeError(res.statusCode, body);
    if (typeof body !== 'object') throw new ParseError(body);
    return body;
  }

  endpoint(path, query = {verb: null}) {
    if (!query.verb) throw new ReferenceError('A verb is required');
    const basePath = normalizePath(path);
    const baseURL = this.baseURL();
    const queryString = encodeURIComponent(JSON.stringify(query));
    const url = `${baseURL}/${basePath}/${queryString}`;
    return {url, json: true};
  }

  basicAuthEndpoint(email, password, query = {}) {
    if (!email || !password) throw new ReferenceError('both email and password are required');
    const queryString = encodeURIComponent(JSON.stringify({verb: 'Auth', ...query}));
    const url = `${this.authURL(email, password)}/auth/${queryString}`;
    return {url, json: true};
  }

  baseURL() {
    return `${this.protocol}://${this.host}:${this.port}`;
  }

  authURL(email, password) {
    const url = this.baseURL();
    const index = url.indexOf('://') + 3;
    return [url.slice(0, index), `${email}:${password}@`, url.slice(index)].join('');
  }
}

function ensureHost(host) {
  if (!host) throw new ReferenceError('host is required');
  if (typeof host !== 'string') throw new TypeError('host must be a string');
  return host;
}

function validateProtocol(protocol) {
  switch (protocol) {
    case 'http': return protocol;
    case 'https': return protocol;
    default: throw new TypeError(`'${protocol}' is not a supported protocol`);
  }
}

function ensurePort(port, protocol) {
  if (!port) return defaultPort(protocol);
  const portInt = parseInt(port, 10);
  if (Number.isNaN(portInt) || portInt < 1 || portInt > 65535) throw new RangeError(`'${port}' is not a valid port`);
  return portInt;
}

function defaultPort(protocol) {
  switch (protocol) {
    case 'http': return 80;
    case 'https': return 443;
    default: return undefined;
  }
}

function normalizePath(path) {
  if (typeof path !== 'string') throw new TypeError(`Received path '${path}' instead of a string`);
  const basePath = path.match(/^\/?(.*?)\/?$/)[1];
  if (!basePath) throw new ReferenceError(`Received empty path '${path}'`);
  return basePath;
}

export function parseRangeQuery(query) {
  if (!query) throw new ReferenceError('missing query object');
  if (typeof query !== 'object') throw new TypeError('query is not an object');
  if (Number.isInteger(query.from) === false) throw new RangeError('query attribute `from` must be an integer');
  if (Number.isInteger(query.count) === false) throw new RangeError('query attribute `count` must be an integer');
  return [Number.parseInt(query.from, 10).toString(), Number.parseInt(query.count, 10).toString()];
}

export function extractIcon(sIco, lIco) {
  const largeIcon = (String(lIco).match(/^\/images\/(.+).png$/) || [])[1];
  const smallIcon = (String(sIco).match(/^\/images\/(.+)_sm.png$/) || [])[1];
  return (largeIcon || smallIcon);
}

export function isPrivate(isPrv) {
  switch (isPrv) {
    case 'T': case 't': case 'true': case true: return true;
    case 'F': case 'f': case 'false': case false: return false;
    default: return null;
  }
}

export function utc(time) {
  return (new Date(time)).toISOString();
}

export const driver = new BacksideDriver(config);
