import fp from 'mostly-func';
import path from 'path';
import { plural } from 'pluralize';
import shortid from 'shortid';
import slug from 'limax';

// get parent or root or top workspaces document
export const getParentDocument = (app, id, doc) => {
  let parentQuery = Promise.resolve();
  // get by id and type
  if (id) {
    const svcDocuments = app.service(plural(doc && doc.type || 'document'));
    return svcDocuments.get(id, {
      query: { $select: 'parent,*' }
    }).then(doc => doc && doc.parent);
  }
  // get by the parent id
  if (doc.parent) {
    const svcDocuments = app.service('documents');
    return svcDocuments.get(doc.parent);
  }
  // get the root folder or workspaces root
  if (doc.path && doc.path !== '/' && doc.path !== '/workspaces') {
    const svcFolder = app.service('folders');
    if (doc.path.startsWith('/workspaces')) {
      return svcFolder.action('first').find({ query: { path : '/workspaces' } });
    } else {
      return svcFolder.action('first').find({ query: { path : '/' } });
    }
  }
  return Promise.resolve();
};

// generate a short typed name for a document
export const shortname = (type, existing, title) => {
  let name = type + '-' + shortid.generate();
  if (existing) {
    name = path.basename(existing); // existing short name
  } else if (title) {
    name = type + '-' + slug(title, { tone: false });
  }
  // if name does not contain and start with doc type, add doc type to name
  if (name.indexOf('-') < 0 && !name.startsWith(type)) {
    name = type + '-' + name;
  }
  return name;
};

export default {};