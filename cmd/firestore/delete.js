const { parseDbPath } = require('../../lib/util');


module.exports = (app) => {
  const dbPath = parseDbPath(app.firebase.firestore(), app.args.shift());

  if (dbPath.isDoc) {
    return dbPath.ref.delete();
  }

  return Promise.reject(new Error('Can not delete collection (only docs)'));
};


module.exports.args = [
  { name: 'path', required: true },
];
