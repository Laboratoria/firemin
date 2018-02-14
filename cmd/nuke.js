'use strict';


const nukeAuth = () => {};


const nukeDatabase = () => {};


const nukeFirestore = () => {};


module.exports = (app) => {
  console.log('nuke!!!', app.opts);
  return Promise.resolve(true);
};


module.exports.args = [];

module.exports.opts = [
  { name: 'only', required: false },
];
