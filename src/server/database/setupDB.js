import r from './rethinkdriver';

// ava is the test database
const databases = process.env.NODE_ENV === 'testing' ? ['ava'] : ['dialogue', 'ava'];

const database = [
  {name: 'users', indices: ['email']},
  {name: 'maps', indices: ['userId']},
  {name: 'nodes', indices: ['mapId']}
];

export default async function setupDB(isReset = false) {
  await Promise.all(databases.map(db => ({db, isReset})).map(migrate));
  await r.getPool().drain();
  console.log(`>> Database setup complete!`);
}

async function migrate({db, isReset}) {
  const dbList = await r.dbList();
  if (dbList.indexOf(db) === -1) {
    console.log(`>> Creating Database: ${db}`);
    await r.dbCreate(db);
  }
  const tables = await r.db(db).tableList();
  if (isReset) {
    console.log(`>> Dropping tables on: ${db}`);
    await Promise.all(tables.map(table => r.db(db).tableDrop(table)));
  }
  console.log(`>> Creating tables on: ${db}`);
  await Promise.all(database.map(table => {
    if (isReset || tables.indexOf(table.name) === -1) {
      return r.db(db).tableCreate(table.name);
    }
    return Promise.resolve(false);
  }));
  console.log(`>> Adding table indices on: ${db}`);
  const tableIndicies = await Promise.all(database.map(table => {
    return r.db(db).table(table.name).indexList().run();
  }));
  await Promise.all([...database.map((table, i) => {
    const indicies = tableIndicies[i] || [];
    return table.indices.map(index => {
      if (indicies.indexOf(index) === -1) {
        return r.db(db).table(table.name).indexCreate(index).run();
      }
      return Promise.resolve(false);
    });
  })]);
  console.log(`>> Setup complete for: ${db}`);
}
