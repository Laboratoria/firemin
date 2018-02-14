'use strict';


const defaultOptions = {
	batchSize: 100,
	batchInterval: 1000,
};


module.exports = (firestore, options) => {
	const { batchSize, batchInterval } = { ...defaultOptions, ...options };
	const ops = [];

	const processChunks = (chunks, cb, results) => {
		if (!results) {
			results = [];
		}

		if (!chunks.length) {
			return cb(null, results);
		}

		const batch = firestore.batch();

		chunks[0].forEach(op => batch[op[0]](op[1], op[2]));

		batch.commit().then((batchResults) => {
			setTimeout(
				() => processChunks(chunks.slice(1), cb, [...results, ...batchResults]),
				batchInterval,
			);
		}, cb);
	};

	const addOps = (method, ref, val) => {
		if (Array.isArray(ref) && typeof val === 'undefined') {
			ref.forEach(pair => {
				ops.push([
					method,
					Array.isArray(pair) && pair.length > 0 ? pair[0] : pair,
					Array.isArray(pair) && pair.length > 1 ? pair[1] : undefined,
				]);
			})
		} else {
			ops.push([method, ref, val]);
		}
	};

	return {
		length: () => ops.length,
    set: (ref, val) => addOps('set', ref, val),
    update: (ref, val) => addOps('update', ref, val),
    delete: (ref) => addOps('delete', ref),
		commit: () => {
			const chunks = ops.reduce((memo, op) => {
				if (memo.length && memo[memo.length - 1].length < batchSize) {
					memo[memo.length - 1].push(op);
					return memo;
				}
				return [...memo, [op]];
			}, []);

			return new Promise((resolve, reject) => {
				processChunks(chunks, (err) => {
					if (err) {
						return reject(err);
					}
					resolve();
				});
			});
		},
	};
};
