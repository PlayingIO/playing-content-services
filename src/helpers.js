import fp from 'ramda';
import { plural } from 'pluralize';

const populateList = (list, idField) => (data) => {
  return fp.map((doc) => {
    let item = data.find((item) => {
      return String(doc[idField]) === String(item.id);
    });
    return item && fp.mergeAll([{ _id: doc.id }, doc, item]);
  })(list);
};

const populateByService = (app, idField, typeField, options) => (list) => {
  let types = fp.groupBy(fp.prop(typeField), list);
  return Promise.all(
    Object.keys(types).map((type) => {
      let entries = types[type];
      return app.service(plural(type)).find(Object.assign({
        query: {
          _id: { $in: fp.map(fp.prop(idField), entries) },
        }
      }, options));
    })
  ).then((results) => {
    return fp.pipe(
      fp.map(fp.prop('data')),
      fp.flatten,
      populateList(list, idField),
      fp.reject(fp.isNil)
    )(results);
  });
};

export default { populateList, populateByService };