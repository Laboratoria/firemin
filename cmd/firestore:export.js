'use strict';


module.exports = (app) => {
	const db = app.firebase.firestore();
	console.log('firestore:export');
	return Promise.resolve(true);
};


module.exports.args = [
	{ name: 'outfile', required: true },
];
