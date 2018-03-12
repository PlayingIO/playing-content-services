import dateFn from 'date-fns';
import { helpers } from 'mostly-feathers-mongoose';
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

export const getPermisionStatus = (ace) => {
  const now = new Date();
  if (ace.begin || ace.end) {
    if (ace.begin && dateFn.isBefore(now, ace.begin)) return 'pending';
    if (ace.begin && ace.end && dateFn.isWithinRange(now, ace.start, ace.end)) return 'effective';
    if (ace.end && dateFn.isAfter(now, ace.end)) return 'archived';
  }
  return 'effective';
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
    const permissions = fp.map(permit => {
      return fp.assoc('status', getPermisionStatus(permit), permit);
    }, results.data || results);
    return fp.groupBy(permit => helpers.getId(permit.subject), permissions);
  });
};

export const getParentAces = (app, docs, select = 'user,creator,*') => {
  const svcDocuments = app.service('user-documents');
  const svcPermissions = app.service('user-permissions');
  const typedIds = fp.flatMap(doc => {
    return fp.map(helpers.typedId, doc.ancestors || []);
  }, docs);
  const ancestorIds = fp.flatMap(doc => fp.prop('ancestors', doc), docs);

  const getParentPermissions = (ids) => ids.length > 0?
    svcPermissions.find({
      query: { subject: { $in: ids }, $select:  select },
      paginate: false
    }) : Promise.resolve([]);
  const getAncestors = (ids) => ids.length > 0?
    helpers.findWithTypedIds(app, ids) : Promise.resolve([]);
  
  return Promise.all([
    getParentPermissions(typedIds),
    getAncestors(ancestorIds),
  ]).then(([permits, ancestors]) => {
    const permissions = fp.map(permit => {
      return fp.assoc('status', getPermisionStatus(permit), permit);
    }, permits.data || permits);
    return fp.reduce((arr, doc) => {
      arr[doc.id] = [];
      for (let i = (doc.ancestors || []).length - 1; i >= 0; i--) {
        if (doc.ancestors[i]) {
          const ancestor = fp.find(
            fp.propEq('id', helpers.getId(doc.ancestors[i])), ancestors);
          const ancestorAces = fp.filter(
            fp.propEq('subject', helpers.typedId(doc.ancestors[i])), permissions);
          if (ancestorAces.length > 0) {
            // subject change to current doc
            const aces = fp.map(fp.assoc('subject', helpers.typedId(doc)), ancestorAces);
            arr[doc.id] = arr[doc.id].concat(aces);
          }
          // continue to get inherited permissions or not
          if (!ancestor || !ancestor.inherited) break;
        }
      }
      return arr;
    }, {}, docs);
  });
};

export default {};