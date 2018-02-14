'use strict';


const fs = require('fs');
const path = require('path');
const readline = require('readline');


module.exports = app => new Promise((resolve, reject) => {
  const db = app.firebase.firestore();
  const infile = path.resolve(app.args.shift());
  const rl = readline.createInterface({
    input: fs.createReadStream(infile),
    crlfDelay: Infinity,
  });

  rl.on('line', (line) => {
    // console.log(`Line from file: ${line}`);
    console.log('line');
  });

  rl.on('close', resolve);
});


module.exports.args = [
  { name: 'infile', required: true },
];
