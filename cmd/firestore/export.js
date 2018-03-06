'use strict';


const serialize = doc => JSON.stringify({
  path: doc.ref.path,
  id: doc.id,
  data: doc.data(),
});


const printDoc = doc => console.log(doc) || Promise.resolve(true);


const backupDoc = doc =>
  printDoc(serialize(doc))
    .then(() => doc.ref.getCollections())
    .then(collections => Promise.all(collections.map(backupCollection)));


const backupCollection = collection =>
  collection.get()
    .then(snap => Promise.all(snap.docs.map(backupDoc)));


module.exports = app =>
  app.firebase.firestore().getCollections()
    .then(collections => Promise.all(collections.map(backupCollection)));


module.exports.args = [
  // { name: 'outfile', required: true },
];
