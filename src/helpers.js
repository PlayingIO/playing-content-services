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

export const getAces = (app, docs) => {
  const svcPermissions = app.service('user-permissions');
  const typedIds = fp.map(helpers.typedId, docs);
  return svcPermissions.find({
    query: {
      subject: { $in: typedIds },
      $select: 'user,creator,*' // populate user/creator
    }
  }).then(results => {
    const permissions = fp.map(permit => {
      return fp.assoc('status', getPermisionStatus(permit), permit);
    }, results.data || results);
    return fp.groupBy(permit => helpers.getId(permit.subject), permissions);
  });
};

export const getParentAces = (app, docs) => {
  const svcPermissions = app.service('user-permissions');
  const typedIds = fp.flatMap(doc => {
    return fp.map(helpers.typedId, doc.ancestors || []);
  }, docs);
  return svcPermissions.find({
    query: {
      subject: { $in: typedIds },
      $select: 'user,creator,*' // populate user/creator
    }
  }).then(results => {
    const permissions = fp.map(permit => {
      return fp.assoc('status', getPermisionStatus(permit), permit);
    }, results.data || results);
    return fp.reduce((arr, doc) => {
      for (let i = (doc.ancestors || []).length - 1; i >= 0; i--) {
        if (doc.ancestors[i]) {
          const subject = helpers.typedId(doc.ancestors[i]);
          const parentAces = fp.filter(fp.propEq('subject', subject), permissions);
          if (parentAces.length > 0) {
            arr[doc.id] = parentAces;
            break;
          }
        }
      }
      return arr;
    }, {}, docs);
  });
};

export default {};