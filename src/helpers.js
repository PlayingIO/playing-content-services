import path from 'path';
import { plural } from 'pluralize';

/**
 * Move documents to target
 */
export const moveDocument = async (app, doc, target) => {
  const svcService = app.service(plural(doc.type || 'document'));
  const data = {
    parent: target.id,
    path: path.resolve(target.path, path.basename(doc.path)),
    type: doc.type
  };
  return svcService.patch(doc.id, data);
};