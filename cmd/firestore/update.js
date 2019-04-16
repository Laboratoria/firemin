const path = require('path');
const pact = require('pact');
const { parseDbPath } = require('../../lib/util');


module.exports = (app) => {
  const db = app.firebase.firestore();
  const dbPath = parseDbPath(db, app.args.shift());
  const infile = path.resolve(app.args.shift());
  const data = require(infile);

  if (dbPath.isDoc) {
    return dbPath.ref.update(data);
  }

  const getTasks = Object.keys(data).map(key => () => dbPath.ref.doc(key).get());

  return pact(getTasks, 1000, 500)
    .then((getResults) => {
      const updateTasks = getResults.map(
        snap => () => snap.ref[snap.exists ? 'update' : 'set'](data[snap.id]),
      );
      return pact(updateTasks, 20, 500, false);
    })
    .then((updateResults) => {
      console.log('updateResults', updateResults);
    });
};


module.exports.args = [
  { name: 'path', required: true },
  { name: 'infile', required: false },
];
