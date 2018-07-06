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
 * Get children documents
 */
export const getChildrens = async (app, parents) => {
  const svcDocuments = app.service('documents');
  const children = await svcDocuments.find({
    query: { parent: { $in: parents } },
    paginate: false
  });
  return fp.groupBy(fp.prop('parent'), children);
};

/**
 * Fanout move/copy operation to children documents
 */
export const fanoutDocuments = async (app, documents, operation, target) => {
  // get children documents with skip/limit
  const parents = fp.map(fp.prop('id'), documents);
  const childrens = await getChildrens(app, parents);
  if (!fp.isEmpty(childrens)) {
    for (const [parent, children] of Object.entries(childrens)) {
      app.agenda.now('fanout_documents', {
        operation, documents: children, target: parent
      });
      // process next batch of children
      await fanoutDocuments(app, children, operation, parent);
    }
  }
};

/**
 * Copy documents to target
 */
export const copyDocument = async (app, doc, target) => {
  const svcService = app.service(plural(doc.type || 'document'));
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
  const svcService = app.service(plural(doc.type || 'document'));
  const data = {
    parent: target.id,
    path: path.resolve(target.path, path.basename(doc.path)),
    type: doc.type
  };
  return svcService.patch(doc.id, data);
};