const splitArrayIntoBatches = (arr, limit) => arr.reduce((memo, item) => {
  if (memo.length && memo[memo.length - 1].length < limit) {
    memo[memo.length - 1].push(item);
    return memo;
  }
  return [...memo, [item]];
}, []);


module.exports = (tasks, concurrency, failFast = true, interval = 0) => {
  const batches = splitArrayIntoBatches(tasks, concurrency);

  const processBatches = (batches, prevStats) => {
    if (!batches.length) {
      return Promise.resolve(prevStats);
    }

    return Promise.all(
      batches[0].map(fn => failFast ? fn() : fn().catch(err => err))
    ).then((results) => {
      const stats = { ...prevStats, results: prevStats.results.concat(results) };
      return (batches.length <= 1)
        ? stats
        : new Promise((resolve, reject) => setTimeout(
          () => processBatches(batches.slice(1), stats).then(resolve, reject),
          interval
        ));
    });
  };

  return processBatches(batches, {
    total: tasks.length,
    concurrency,
    batches: batches.length,
    results: [],
  });
};


module.exports.splitArrayIntoBatches = splitArrayIntoBatches;
