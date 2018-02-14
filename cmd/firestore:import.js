'use strict';


module.exports = (app) => {
  const db = app.firebase.firestore();
  console.log('firestore:import');
  return Promise.resolve(true);
};


module.exports.args = [
  { name: 'infile', required: true },
];
