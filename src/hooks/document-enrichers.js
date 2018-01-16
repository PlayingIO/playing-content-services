import assert from 'assert';
import dateF from 'date-fns';
import fp from 'mostly-func';
import makeDebug from 'debug';
import path from 'path';
import url from 'url';

import { DocTypes, Permissions } from '~/constants';

const debug = makeDebug('playing:content-services:hooks:documentEnrichers');

// check whether there is any folder children
function hasFolderishChild(hook, doc, options) {
  const svcFolders = hook.app.service('folders');
  // only folder need to check hasFolderishChild
  if (doc.type === 'folder') {
    return svcFolders.find({ query: {
      parent: doc.id
    }}).then(result => {
      let folderishChildren = fp.filter(child => {
        return child.metadata.facets && child.metadata.facets.indexOf('Folderish') !== -1;
      }, result.data);
      doc.metadata.hasFolderishChild = folderishChildren.length > 0;
      return doc;
    });
  } else {
    return Promise.resolve(doc);
  }
}

function getBreadcrumbs(hook, doc, options) {
  let breadcrumbs = [];
  let parent = doc.parent;
  while (parent && parent.path) {
    let bread = fp.omit(['parent'], parent);
    breadcrumbs = [bread, ...breadcrumbs];
    parent = parent.parent;
  }
  return breadcrumbs;
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
  }).then((results) => {
    doc.metadata.collections = results || [];
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
    if (results) {
      doc.metadata.favorites = { isFavorite: results.length > 0 };
    }
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
      doc.metadata.acls = [];
      // local permissions
      if (localAces) doc.metadata.acls.push({ name: 'local', aces: localAces });
      // inherited permissions
      if (inherited) {
        doc.metadata.acls.push({ name: 'inherited', aces: inheritedAces || []});
      }
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
  return permissions;
}

function getUserVisiblePermissions(hook, doc, options) {
  return ['Read', 'ReadWrite', 'Everything'];
}

function getSubtypes(hook, doc, options) {
  const Types = options.DocTypes || DocTypes;
  const subtypes = Types[doc.type] && Types[doc.type].subtypes;
  if (subtypes) {
    return Object.values(fp.pick(subtypes, Types));
  }
  return [];
}

function getTags(hook, doc, options) {
  return (doc.tags || []);
}

function getThumbnail(hook, doc) {
  const baseUrl = 'bower_components/playing-content-elements/images/icons/';
  return {
    url: url.resolve(baseUrl, doc.type + '.png')
  };
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

    let enrichers = hook.params.headers['enrichers-document'].split(',').map(e => e.trim());
    debug('enrichers-document %j', enrichers);

    let results = [].concat(hook.result? hook.result.data || hook.result : []);
    let promises = [];

    results.forEach(doc => {
      doc.metadata = doc.metadata || {};
      enrichers.forEach(enricher => {
        switch(enricher) {
          case 'acls':
            promises.push(getAcls(hook, doc, options));
            break;
          case 'breadcrumb':
            doc.metadata.breadcrumbs = getBreadcrumbs(hook, doc, options);
            break;
          case 'collections':
            promises.push(getCollections(hook, doc, options));
            break;
          case 'favorites':
            promises.push(getFavorites(hook, doc, options));
            break;
          case 'hasFolderishChild':
            promises.push(hasFolderishChild(hook, doc, options));
            break;
          case 'permissions':
            doc.metadata.permissions = getPermission(hook, doc, options);
            break;
          case 'preview':
            break;
          case 'renditions':
            break;
          case 'subtypes':
            doc.metadata.subtypes = getSubtypes(hook, doc, options);
            break;
          case 'tags':
            doc.metadata.tags = getTags(hook, doc, options);
            break;
          case 'thumbnail':
            doc.metadata.thumbnail = getThumbnail(hook, doc, options);
            break;
          case 'userVisiblePermissions':
            doc.metadata.userVisiblePermissions = getUserVisiblePermissions(hook, doc, options);
            break;
        }
      });
    });

    return Promise.all(promises).then(results => hook);
  };
}
