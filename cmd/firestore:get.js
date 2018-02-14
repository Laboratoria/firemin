'use strict';


const { parseDbPath } = require('../lib/util');


module.exports = (app) => {
	const db = app.firebase.firestore();
	const dbPath = parseDbPath(db, app.args.shift());

	return dbPath.ref.get()
	  .then(snap =>
		  console.log(
				JSON.stringify(
					(dbPath.isDoc)
					  ? snap.data()
						: snap.docs.reduce((memo, doc) => ({
							...memo,
							[doc.id]: doc.data(),
						}), {})
				)
			)
	  );
};


module.exports.args = [
	{ name: 'path', required: true },
];