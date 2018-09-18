const serialize = doc => JSON.stringify({
  path: doc.ref.path,
  id: doc.id,
  data: doc.data(),
});


const printDoc = doc => console.log(doc) || Promise.resolve(true);


const backupDoc = doc => printDoc(serialize(doc))
  .then(() => doc.ref.getCollections())
  // eslint-disable-next-line no-use-before-define
  .then(collections => Promise.all(collections.map(backupCollection)));


const backupCollection = collection => collection.get()
  .then(snap => Promise.all(snap.docs.map(backupDoc)));


const promisify = (collections, exclude) => collections
  .filter(collection => !exclude.includes(collection.id))
  .map(backupCollection);


module.exports = ({ firebase, opts }) => firebase.firestore().getCollections()
  .then(collections => Promise.all(
    promisify(collections, opts.exclude ? opts.exclude.split(',') : []),
  ))
  .then(() => Promise.resolve(null));


module.exports.args = [
  // { name: 'outfile', required: true },
];
