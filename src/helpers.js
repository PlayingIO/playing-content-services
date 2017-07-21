import fp from 'ramda';
import { plural } from 'pluralize';

const populateList = (list, idField, options = {}) => (data) => {
  return fp.map((doc) => {
    let item = data.find((item) => {
      return String(doc[idField]) === String(item.id);
    });
    // retain _id for orignal id
    const retained = fp.reduce((acc, field) => {
      acc['_' + field] = doc[field];
      return acc;
    }, {});
    return item && fp.mergeAll([retained(options.retained || []), doc, item]);
  })(list);
};

const populateByService = (app, idField, typeField, options = {}) => (list) => {
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
      populateList(list, idField, options),
      fp.reject(fp.isNil)
    )(results);
  });
};

export default { populateList, populateByService };