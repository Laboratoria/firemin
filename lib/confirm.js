const readline = require('readline');


module.exports = (opts) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve, reject) => {
    rl.question(`${opts.text} (y/N) `, (answer) => {
      rl.close();
      resolve(['y', 'yes'].indexOf(answer.toLowerCase()) > -1);
    });
  });
};
