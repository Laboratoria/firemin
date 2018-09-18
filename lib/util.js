exports.parseDbPath = (db, str) => {
  const parts = str.split('/').reduce(
    (memo, part) => ((part) ? [...memo, part] : memo),
    [],
  );
  const path = parts.join('/');
  const isDoc = !(parts.length % 2);

  return {
    path,
    isDoc,
    isCollection: !isDoc,
    ref: (isDoc) ? db.doc(path) : db.collection(path),
  };
};
