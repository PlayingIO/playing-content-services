import assert from 'assert';
import dateF from 'date-fns';
import { helpers } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import makeDebug from 'debug';
import path from 'path';
import url from 'url';

import { DocTypes, Permissions } from '~/constants';

const debug = makeDebug('playing:content-services:hooks:documentEnrichers');

// check whether there is any folder children
function hasFolderishChild(hook, docs, options) {
  // only Folderish need to check hasFolderishChild
  const Types = options.DocTypes || DocTypes;
  const folders = fp.reduce((ids, doc) => {
    if (fp.contains('Folderish', Types[doc.type] && Types[doc.type].facets || [])) {
      return ids.concat(doc.id);
    }
    return ids;
  }, [], docs);

  const svcFolders = hook.app.service('folders');
  const getParents = folders.length > 0
    ? svcFolders.find({ query: { parent: { $in: folders } } })
    : Promise.resolve([]);

  return getParents.then(results => {
    const childrens = fp.groupBy(child => String(child.parent), results.data || results);
    return fp.reduce((acc, doc) => {
      const folderishChildren = fp.filter(child => {
        return fp.contains('Folderish', Types[child.type] && Types[child.type].facets || []);
      }, childrens[doc.id] || []);
      acc[doc.id] = folderishChildren.length > 0;
      return acc;
    }, {}, docs);
  });
}

// assume that client use $select=parent.** with breadcumbs enrichment
function getBreadcrumbs(hook, docs, options) {
  return fp.reduce((acc, doc) => {
    let breadcrumbs = [];
    let parent = doc.parent;
    while (parent && parent.path) {
      let bread = fp.omit(['parent'], parent);
      breadcrumbs = [bread, ...breadcrumbs];
      parent = parent.parent;
    }
    acc[doc.id] = breadcrumbs;
    return acc;
  }, {}, docs);
}

function getCollections(hook, doc, options) {
  const svcDocuments = hook.app.service('documents');
  const svcUserCollections = hook.app.service('user-collections');
  if (!hook.params.user) return Promise.resolve();

  return svcUserCollections.find({
    query: {
      creator: hook.params.user.id,
      document: doc.id,
      category: 'collection'
    },
    paginate: false
  }).then((results) => {
    if (results) {
      let collections = fp.map(fp.prop('parent'), results);
      if (collections.length > 0) {
        return svcDocuments.find({
          query: { _id: { $in: collections } },
          paginate: false
        });
      }
    }
    return [];
  });
}

function getFavorites(hook, doc, options) {
  const svcUserFavorites = hook.app.service('user-favorites');
  if (!hook.params.user) return Promise.resolve();
  
  return svcUserFavorites.find({
    query: {
      user: hook.params.user.id,
      document: doc.id
    },
    paginate: false
  }).then((results) => {
    return { isFavorite: results.length > 0 };
  });
}

function getPermisionStatus(ace) {
  const now = new Date();
  if (ace.begin || ace.end) {
    if (ace.begin && dateF.isBefore(now, ace.begin)) return 'pending';
    if (ace.begin && ace.end && dateF.isWithinRange(now, ace.start, ace.end)) return 'effective';
    if (ace.end && dateF.isAfter(now, ace.end)) return 'archived';
  }
  return 'effective';
}

function getAces(app, document) {
  const svcDocuments = app.service('documents');
  const svcUserGroups = app.service('user-groups');

  const getDocument = document.title
    ? Promise.resolve(document)
    : svcDocuments.get(document);
  return getDocument.then((doc) => {
    if (!(doc && doc.ACL)) return null;
    
    let findUsers = Promise.resolve([]);
    let keys = fp.reject(fp.equals('*'), Object.keys(doc.ACL));
    const creators = fp.reject(fp.isNil, fp.map(fp.prop('creator'), Object.values(doc.ACL)));
    keys = keys.concat(creators);
    if (keys.length > 0) {
      findUsers = svcUserGroups.find({ query: {
        _id: { $in: keys }
      }});
    }
    return findUsers.then(users => {
      const aces = fp.map(key => {
        const ace = doc.ACL[key];
        return Object.assign({}, ace, {
          status: getPermisionStatus(ace),
          creator: ace.creator? fp.findById(ace.creator, users) : null,
          user: fp.findById(key, users)
        });
      }, Object.keys(doc.ACL));
      return aces;
    });
  });
}

function getAcls(hook, doc, options) {
  if (!(doc && doc.ACL)) return Promise.resolve(null);

  const inherited = doc.ACL['*'] && doc.ACL['*'].inherited === true;
  const getLocalAces = getAces(hook.app, doc);
  const getInheritedAces = doc.parent? getAces(hook.app, doc.parent) : Promise.resolve(null);

  return Promise.all([getLocalAces, getInheritedAces])
    .then(([localAces, inheritedAces]) => {
      let acls = [];
      // local permissions
      if (localAces) acls.push({ name: 'local', aces: localAces });
      // inherited permissions
      if (inherited) {
        acls.push({ name: 'inherited', aces: inheritedAces || []});
      }
      return acls;
    });
}

function getPermission(hook, doc, options) {
  const Types = options.DocTypes || DocTypes;
  const subtypes = Types[doc.type] && Types[doc.type].subtypes;
  // TODO: user acls
  let permissions = ['Everything', 'Read', 'Write', 'ReadWrite'];
  if (subtypes) {
    permissions = permissions.concat(['ReadChildren', 'AddChildren', 'RemoveChildren']);
  }
  return Promise.resolve(permissions);
}

function getUserVisiblePermissions(hook, doc, options) {
  return Promise.resolve(['Read', 'ReadWrite', 'Everything']);
}

function getSubtypes(hook, doc, options) {
  const Types = options.DocTypes || DocTypes;
  const subtypes = Types[doc.type] && Types[doc.type].subtypes;
  let types = [];
  if (subtypes) {
    types = Object.values(fp.pick(subtypes, Types));
  }
  return Promise.resolve(types);
}

function getTags(hook, doc, options) {
  return Promise.resolve(doc.tags || []);
}

function getThumbnail(hook, doc) {
  const baseUrl = 'bower_components/playing-content-elements/images/icons/';
  return Promise.resolve({
    url: url.resolve(baseUrl, doc.type + '.png')
  });
}

// Add document metadata according to request header
export default function documentEnrichers(options = {}) {
  return (hook) => {
    assert(hook.type === 'after', `documentEnrichers must be used as a 'after' hook.`);

    // If no enrichers-document header then skip this hook
    if (!(hook.params.headers && hook.params.headers['enrichers-document'])) {
      debug('Skip documentEnrichers without headers', hook.params);
      return hook;
    }

    const enrichers = fp.map(fp.trim, hook.params.headers['enrichers-document'].split(','));
    debug('enrichers-document %j', enrichers);

    let documents = helpers.getHookDataAsArray(hook);
    let promises = {};
    
    enrichers.forEach(enricher => {
      switch(enricher) {
        case 'acls':
          promises.acls = getAcls(hook, documents, options);
          break;
        case 'breadcrumb':
          promises.breadcrumb = getBreadcrumbs(hook, documents, options);
          break;
        case 'collections':
          promises.collections = getCollections(hook, documents, options);
          break;
        case 'favorites':
          promises.favorites = getFavorites(hook, documents, options);
          break;
        case 'hasFolderishChild':
          promises.hasFolderishChild = hasFolderishChild(hook, documents, options);
          break;
        case 'permissions':
          promises.permissions = getPermission(hook, documents, options);
          break;
        case 'preview':
          promises.preview = Promise.resolve(null);
          break;
        case 'renditions':
          promises.renditions = Promise.resolve(null);
          break;
        case 'subtypes':
          promises.subtypes = getSubtypes(hook, documents, options);
          break;
        case 'tags':
          promises.tags = getTags(hook, documents, options);
          break;
        case 'thumbnail':
          promises.thumbnail = getThumbnail(hook, documents, options);
          break;
        case 'userVisiblePermissions':
          promises.userVisiblePermissions = getUserVisiblePermissions(hook, documents, options);
          break;
      }
    });

    return Promise.props(promises).then(results => {
      documents.forEach(doc => {
        doc.metadata = doc.metadata || {};
        for (const enricher of Object.keys(results)) {
          if (results[enricher]) {
            doc.metadata[enricher] = results[enricher][doc.id];
          }
        }
      });
      return hook;
    });
  };
}
