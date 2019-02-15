#! /usr/bin/env node


const minimist = require('minimist');
const firebaseAdmin = require('firebase-admin');
const pkg = require('./package.json');


const commands = [
  'auth:nuke',
  'firestore:get',
  'firestore:set',
  'firestore:update',
  'firestore:delete',
  'firestore:import',
  'firestore:export',
].reduce((memo, key) => ({
  ...memo,
  [key]: require(`./cmd/${key.split(':').join('/')}`),
}), {});


const help = `
Usage: ${pkg.name} [options] [command]

Options:

  -k, --key [path]  Path to service account key
  -h, --help        Show help
  -v, --version     Show version

Commands:

${Object.keys(commands)
    .map(
      cmdName => `  ${cmdName} ${
        commands[cmdName].args
          .map(arg => (arg.required ? `<${arg.name}>` : `[${arg.name}]`))
          .join(' ')
      }`,
    )
    .join('\n')}
`;


const success = (message) => {
  if (message) {
    console.log(message);
  }
  process.exit(0);
};


const error = (err) => {
  console.error(err);
  console.error(`Try "${pkg.name} --help" to see available commands and options`);
  process.exit(1);
};


const { _: args, ...opts } = minimist(process.argv.slice(2));
const cmdName = args.shift();


if (opts.v || opts.version) {
  success(pkg.version);
}

if (!cmdName) {
  success(help);
}

if (!Object.prototype.hasOwnProperty.call(commands, cmdName)) {
  error('Unkown command');
}

if (opts.h || opts.help) {
  success('show command specific help');
}


const serviceAccountKeyPath = (
  opts.k
  || opts.key
  || process.env.FIREMIN_SERVICE_ACCOUNT_KEY
);


if (!serviceAccountKeyPath) {
  error('No path to service account key file');
}

const serviceAccountKey = require(serviceAccountKeyPath);
const firebase = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccountKey),
  databaseURL: `https://${serviceAccountKey.project_id}.firebaseio.com`,
});


commands[cmdName]({
  args,
  opts,
  firebase,
  serviceAccountKey,
})
  .then(success)
  .catch(error);
