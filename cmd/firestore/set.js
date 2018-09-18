const path = require('path');
const { parseDbPath } = require('../../lib/util');


module.exports = (app) => {
  const dbPath = parseDbPath(app.firebase.firestore(), app.args.shift());
  const infile = path.resolve(app.args.shift());
  const data = require(infile);

  if (dbPath.isDoc) {
    return dbPath.ref.set(data);
  }

  return Promise.reject(new Error('Can not set collection (only docs)'));

  // return dbPath.ref.get()
  //   .then(snap => {
  //     snap.forEach(doc => {
  //       console.log(doc.id);
  //     });
  //   });
};


module.exports.args = [
  { name: 'path', required: true },
  { name: 'infile', required: false },
];
