import { flatten, groupBy, map, omit } from 'lodash';
import { plural } from 'pluralize';

export function populateByService(app, documents, idField, typeField, options) {
  let types = groupBy(documents, typeField);
  return Promise.all(
    Object.keys(types).map((type) => {
      let entries = types[type];
      return app.service(plural(type)).find(Object.assign({
        query: {
          _id: { $in: map(entries, idField) },
        }
      }, options));
    })
  ).then((results) => {
    results = options.provider? flatten(map(results, 'data')) : flatten(results);
    documents = map(documents, (doc) => {
      return Object.assign({ _id: doc.id }, doc, results.find((item) => {
        return String(doc[idField]) === String(item.id);
      }));
    });
    return documents;
  });
}