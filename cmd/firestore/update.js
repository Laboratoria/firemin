const path = require('path');
const throttledBatch = require('../../lib/throttled-batch');
const { parseDbPath } = require('../../lib/util');


module.exports = (app) => {
  const db = app.firebase.firestore();
  const dbPath = parseDbPath(db, app.args.shift());
  const infile = path.resolve(app.args.shift());
  const data = require(infile);

  if (dbPath.isDoc) {
    return dbPath.ref.update(data);
  }

  return Promise.all(Object.keys(data).map(key => dbPath.ref.doc(key).get()))
    .then((results) => {
      const batch = throttledBatch(db);
      results.forEach((snap) => {
        batch[snap.exists ? 'update' : 'set'](snap.ref, data[snap.id]);
      });
      return batch.commit();
    });
};


module.exports.args = [
  { name: 'path', required: true },
  { name: 'infile', required: false },
];
