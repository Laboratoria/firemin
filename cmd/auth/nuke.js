'use strict';


const path = require('path');
const confirm = require('../../lib/confirm');
const pact = require('../../lib/pact');


const printStats = (users, stats) => {
  console.log('Stats\n=====');
  console.log('Total processed:', stats.total);
  console.log('Concurrency', stats.concurrency);
  console.log('Interval between batches:', stats.concurrency);
  console.log('Batches:', stats.batches);

  const { error, success } = stats.results.reduce(
    (memo, result, idx) =>
      (result instanceof Error)
        ? {
          ...memo,
          error: memo.error.concat({
            message: result.message,
            user: users[idx],
          }),
        }
        : {
          ...memo,
          success: memo.success.concat(result),
        },
    { error: [], success: [] }
  );

  console.log('Success:', success.length);
  console.log('Failures:', error.length);

  console.log('\nFailed deletions\n================');
  error.forEach(({ user, message }) => console.log(`${user.email}: ${message}`));
};


module.exports = (app) => {
  const projectId = app.serviceAccountKey.project_id;
  const { users } = require(path.resolve(app.args.shift()));
  const db = app.firebase.firestore();
  const auth = app.firebase.auth();

  return confirm({
    text: `You are trying to delete ${users.length} from ${projectId}. Are you sure?`
  }).then((confirmed) => {
    if (!confirmed) {
      console.log('Operation cancelled. Nothing done.');
      return;
    }

    const tasks = users.map(user => () => auth.deleteUser(user.localId));
    // const tasks = users.map(user => () => auth.getUser(user.localId));

    // Throttle requests to under 10 per second to avoid exceeding quota.
    // https://firebase.google.com/docs/auth/limits
    return pact(tasks, 5, false, 1000).then(printStats.bind(null, users));
  });
};


module.exports.args = [
  { name: 'auth-json', required: true },
];
