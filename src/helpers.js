import { helpers } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import path from 'path';
import { plural } from 'pluralize';
import shortid from 'shortid';
import slug from 'limax';

export const isRootFolder = (path) => {
  return fp.contains(path, ['/', '/workspaces']);
};

// get parent or root or top workspaces document
export const getParentDocument = async (app, id, doc) => {
  // get by the parent if provided
  if (doc.parent) {
    const svcDocuments = app.service('documents');
    return svcDocuments.get(doc.parent);
  }
  // get by id and type
  if (id) {
    const svcDocuments = app.service(plural(doc && doc.type || 'document'));
    return svcDocuments.get(id, {
      query: { $select: 'parent,*' }
    }).then(doc => doc && doc.parent);
  }
  // get the root folder or workspaces root
  if (!isRootFolder(doc.path)) {
    const svcFolder = app.service('folders');
    if (doc.path.startsWith('/workspaces')) {
      return svcFolder.get(null, { query: { path : '/workspaces' } });
    } else {
      return svcFolder.get(null, { query: { path : '/' } });
    }
  }
  return null;
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

export const getAces = (app, docs, select = 'user,creator,*') => {
  const svcPermissions = app.service('user-permissions');
  const typedIds = fp.map(helpers.typedId, docs);
  return svcPermissions.find({
    query: {
      subject: { $in: typedIds },
      $select: select
    }
  }).then(results => {
    return fp.groupBy(permit => helpers.getId(permit.subject), fp.propOf('data', results));
  });
};

export const getParentAces = async (app, docs, select = 'user,creator,*') => {
  const svcDocuments = app.service('user-documents');
  const svcPermissions = app.service('user-permissions');
  const typedIds = fp.uniq(fp.flatMap(doc => {
    return fp.map(helpers.typedId, doc.ancestors || []);
  }, docs));

  const getAncestors = (ids) => ids.length > 0?
    helpers.findWithTypedIds(app, ids) : Promise.resolve([]);
  const getAncestorPermissions = (ids) => ids.length > 0?
    svcPermissions.find({
      query: { subject: { $in: ids }, $select: select },
      paginate: false
    }) : Promise.resolve([]);

  const [ancestors, permits] = await Promise.all([
    getAncestors(typedIds),
    getAncestorPermissions(typedIds)
  ]);
  const permissions = fp.propOf('data', permits);
  return fp.reduce((arr, doc) => {
    if (!doc.ancestors) return arr;
    arr[doc.id] = [];
    // acnestor reverse loop to check inheritance
    for (let i = doc.ancestors.length - 1; i >= 0; i--) {
      const ancestor = fp.find(
        fp.propEq('id', helpers.getId(doc.ancestors[i])), ancestors);
      if (!ancestor) break;

      const ancestorAces = fp.filter(
        fp.propEq('subject', helpers.typedId(doc.ancestors[i])), permissions);
      if (ancestorAces.length > 0) {
        // subject change to current doc
        const aces = fp.map(fp.assoc('subject', helpers.typedId(doc)), ancestorAces);
        arr[doc.id] = arr[doc.id].concat(aces);
      }
      // continue to next inherited
      if (!ancestor.inherited) break;
    }
    return arr;
  }, {}, docs);
};

// create a document activity
export const createDocumentActivity = (context, document, custom) => {
  const actor = helpers.getId(document.creator);
  return {
    actor: `user:${actor}`,
    object: `${document.type}:${document.id}`,
    foreignId: `${document.type}:${document.id}`,
    time: new Date().toISOString(),
    ...custom
  };
};