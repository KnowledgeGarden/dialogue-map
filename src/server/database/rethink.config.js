import parseRethinkdbUrl from 'parse-rethinkdb-url';

const defaults = {
  host: 'localhost',
  port: 28015,
  db: process.env.NODE_ENV === 'testing' ? 'ava' : 'dialogue',
  min: process.env.NODE_ENV === 'production' ? 50 : 3,
  buffer: process.env.NODE_ENV === 'production' ? 50 : 3
};
const env = process.env.RETHINKDB_URL ? parseRethinkdbUrl(process.env.RETHINKDB_URL) : {};

export default {...defaults, ...env};
