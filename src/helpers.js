import fp from 'mostly-func';
import shortid from 'shortid';
import slug from 'limax';

// get parent or root or top workspaces document
export const getParentDocument = (app, path, parent) => {
  const svcDocuments = app.service('documents');
  let parentQuery = Promise.resolve();
  if (parent) {
    parentQuery = () => svcDocuments.get(parent);
  } else if (path !== '/' && path !== '/workspaces') {
    if (path.startsWith('/workspaces')) {
      parentQuery = svcDocuments.action('first').find({ query: { path : '/workspaces' } });
    } else {
      parentQuery = svcDocuments.action('first').find({ query: { path : '/' } });
    }
  }
  return parentQuery;
};

// generate a short typed name for a document
export const shortname = (type, path, title) => {
  let name = type + '-' + shortid.generate();
  if (path) {
    name = path.basename(path); // existing short name
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