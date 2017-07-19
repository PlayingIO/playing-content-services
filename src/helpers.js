import fp from 'lodash/fp';
import { plural } from 'pluralize';

const populateList = (list, idField) => (data) => {
  return fp.map((doc) => {
    let item = data.find((item) => {
      return String(doc[idField]) === String(item.id);
    });
    return item;
  })(list);
};

const populateByService = (app, idField, typeField, options) => (list) => {
  let types = fp.groupBy(typeField, list);
  return Promise.all(
    Object.keys(types).map((type) => {
      let entries = types[type];
      return app.service(plural(type)).find(Object.assign({
        query: {
          _id: { $in: fp.map(idField, entries) },
        }
      }, options));
    })
  ).then((results) => {
    return fp.flow(
      options.provider? fp.flow(fp.map('data'), fp.flatten) : fp.flatten,
      populateList(list, idField),
      fp.compact
    )(results);
  });
};

export default { populateList, populateByService };