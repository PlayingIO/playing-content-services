import fp from 'mostly-func';
import path from 'path';
import { plural } from 'pluralize';

export const getMetaSubtypes = (doc) => {
  return fp.map(
    type => type.type.toLowerCase(),
    doc.metadata && doc.metadata.subtypes || []
  );
};

/**
 * Copy documents to target
 */
export const copyDocument = async (app, doc, target) => {
  const svcService = this.app.service(plural(doc.type || 'document'));
  let clone = fp.omit([
    'id', 'metadata', 'parent', 'path', 'ancestors',
    'createdAt', 'updatedAt', 'destroyedAt'
  ], doc);
  clone.parent = target;
  return svcService.create(clone);
};

/**
 * Move documents to target
 */
export const moveDocument = async (app, doc, target) => {
  const svcService = this.app.service(plural(doc.type || 'document'));
  const data = {
    parent: target.id,
    path: path.resolve(target.path, path.basename(doc.path)),
    type: doc.type
  };
  return svcService.patch(doc.id, data);
};