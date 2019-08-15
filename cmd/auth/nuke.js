const porch = require('porch');
const ProgressBar = require('progress');
const confirm = require('../../lib/confirm');


const printStats = (users, results) => {
  console.log('Stats\n=====');
  console.log('Total processed:', users.length);
  console.log('Success:', results.success);
  console.log('Failures:', results.errors.length);

  if (results.errors.length) {
    console.log('\nFailed deletions\n================');
    results.errors.forEach((data) => {
      console.error(users[data.idx].localId, users[data.idx].email, data.result.message);
    });
  }
};


const getUsers = (auth, nextPageToken) => (
  auth.listUsers(1000, nextPageToken)
    .then(({ users, pageToken }) => ({
      users: users.map(userRecord => userRecord.toJSON()),
      pageToken,
    }))
    .then(({ users, pageToken }) => (
      (!pageToken)
        ? users
        : getUsers(auth, pageToken).then(nextUsers => [...users, ...nextUsers])
    ))
);


module.exports = (app) => {
  const projectId = app.serviceAccountKey.project_id;
  const auth = app.firebase.auth();

  return getUsers(auth)
    .then(
      users => confirm({
        text: `You are trying to delete ${users.length} users from ${projectId}. Are you sure?`,
      })
        .then(confirmed => ({ confirmed, users })),
    )
    .then(({ users, confirmed }) => {
      if (!confirmed) {
        console.log('Operation cancelled. Nothing done.');
        return false;
      }

      const tasks = users.map(user => () => auth.deleteUser(user.uid));
      const bar = new ProgressBar('[:bar] :current/:total :rate/s :percent :etas', {
        width: 50,
        total: users.length,
      });

      // Throttle requests to under 10 per second to avoid exceeding quota.
      // https://firebase.google.com/docs/auth/limits
      return new Promise((resolve) => {
        const results = { success: 0, errors: [] };
        porch.createStream(tasks, 10, 1000, false)
          .on('data', (data) => {
            bar.tick();
            Object.assign(
              results,
              (data.result instanceof Error)
                ? { errors: [...results.errors, data] }
                : { success: results.success + 1 },
            );
          })
          .on('end', () => {
            printStats(users, results);
            resolve();
          });
      });
    });
};
