const fs = require('fs');
const path = require('path');
const readline = require('readline');
const throttledBatch = require('../../lib/throttled-batch');


const entryKeys = ['path', 'id', 'data'];


const ensureValidEntry = (entry) => {
  const keys = Object.keys(entry);
  if (keys.length !== 3) {
    throw new Error('Expected each entry to have 3 keys');
  }
  keys.forEach((key) => {
    if (entryKeys.indexOf(key) === -1) {
      throw new Error('Entries can only have path, id and data props');
    }
  });
};


module.exports = app => new Promise((resolve, reject) => {
  const db = app.firebase.firestore();
  const infile = path.resolve(app.args.shift());
  const stats = { total: 0, errors: [] };
  const batch = throttledBatch(db, { batchSize: 250 });
  const rl = readline.createInterface({
    input: fs.createReadStream(infile),
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    stats.total += 1;
    try {
      const json = JSON.parse(line);
      ensureValidEntry(json);
      batch.set(db.doc(json.path), json.data);
    } catch (err) {
      stats.errors.push(err);
    }
  });

  rl.on('close', () => {
    console.log(stats.total, stats.errors.length);
    batch.commit().then(resolve).catch(reject);
  });
});


module.exports.args = [
  { name: 'infile', required: true },
];
