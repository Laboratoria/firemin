# Firemin

## Installation

```sh
npm i -g Laboratoria/firemin
```

## Configuration

In order to use `firemin` you need to provide a [_service account key_ file for
the project you want to work with](https://firebase.google.com/docs/admin/setup?hl=en-419#add_firebase_to_your_app).

There are basically two ways to tell `firemin` what _service account key file_
it should use: using command line _options_ on via the _environment_.

### Options

You can specify the _service account key file_ to be used with the `-k` or
`--key` options on each invocation of `firemin`.

```sh
# Using the `-k` option (shorthand)
firemin firestore:get /foo -k /path/to/service-account-key.json

# Using the `--key` option
firemin firestore:get /foo --key /path/to/service-account-key.json
```

### Environment

Alternatively, you can set `FIREMIN_SERVICE_ACCOUNT_KEY` in your environment and
`firemin` will use that when `-k` and `--key` are not present.

```sh
# Set environment variable
export FIREMIN_SERVICE_ACCOUNT_KEY=~/path/to/service-account-key.json

# Run firemin using the service account key file specified in the environment
firemin firestore:get /foo
firemin firestore:get /bar
```

## Usage

```sh
$ firemin

Usage: firemin [options] [command]

Options:

  -k, --key [path]  Path to service account key
  -h, --help        Show help
  -v, --version     Show version

Commands:

  auth:nuke <auth-json>
  firestore:get <path>
  firestore:set <path> [infile]
  firestore:update <path> [infile]
  firestore:delete <path>
  firestore:import <infile>
  firestore:export

```

## Examples

### Backup / restore

````sh
# Exports base de datos
firemin firestore:export db.dump

# Importa base de datos
firemin firestore:import db.dump
````

### Nuke/delete all users

```sh
# First we need to export all the users from the project
firebase auth:export auth.json

# Now we can use the exported users from the previous step to
# delete all users from firebase.
firemin auth:nuke ./auth.json
```
