import assert from 'assert';
import makeDebug from 'debug';
import { hooks as auth } from 'feathers-authentication';
import { filter, kebabCase, omit, pick } from 'lodash';
import { hooks } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import dateF from 'date-fns';
import path from 'path';
import shortid from 'shortid';
import url from 'url';

import { DocTypes, Permissions } from '~/constants';
import DocumentEntity from '~/entities/document-entity';
import FolderEntity from '~/entities/folder-entity';
import FileEntity from '~/entities/file-entity';
import NoteEntity from '~/entities/note-entity';

const debug = makeDebug('playing:content-services:hooks');

const defaultEntities = {
  document: DocumentEntity,
  folder: FolderEntity,
  file: FileEntity,
  note: NoteEntity
};

export function isDocument() {
  return (hook) => {
    if (hook.type === 'before') {
      return hook.params.type === 'document';
    }
    if (hook.type === 'after') {
      const result = hook.result.data || hook.result;
      if (Array.isArray(result)) {
        return fp.reduce((acc, doc) =>
          acc && doc.type === 'document', true, result);
      } else {
        return result.type === 'document';
      }
    }
  };
}

// presentEntity by document type
export function presentDocument(options = {}) {
  const entities = Object.assign(defaultEntities, options.entities);

  return (hook) => {
    const presentEntity = function(doc) {
      options.provider = hook.params.provider;

      if (doc.type && entities[doc.type]) {
        debug('present ' + doc.type + ' type entity', doc.id);
        return entities[doc.type].parse(doc, options);
      } else {
        debug('WARNING: ' + doc.type + ' type entity not found in');
        debug('  options  =>', options);
        debug('  document =>', doc);
        return DocumentEntity.parse(doc, options);
      }
    };

    const presentData = function(data) {
      if (Array.isArray(data)) {
        return data.map(presentEntity);
      } else {
        return presentEntity(data);
      }
    };

    if (hook.result) {
      if (hook.result.data) {
        hook.result.data = presentData(hook.result.data);
      } else {
        hook.result = presentData(hook.result);
      }
    }
    return hook;
  };
}

// compute current path by parent
export function computePath(options = { slug: false }) {
  return (hook) => {
    const documents = hook.app.service('documents');

    // get parent or root
    let parentQuery = null;
    if (hook.data.parent) {
      parentQuery = documents.get(hook.data.parent);
    } else if (hook.method === 'create') {
      parentQuery = documents.first({ query: { path : '/' } });
    }

    if (parentQuery) {
      return parentQuery.then(parent => {
        if (parent && parent.path) {
          hook.data.parent = parent.id;
          let slug = 'untitled';
          if (options.slug) {
            if (hook.data.title && hook.data.title.length > 0) {
              slug = kebabCase(hook.data.title);
            }
          } else {
            slug = hook.data.path && path.basename(hook.data.path) || shortid.generate();
          }
          debug('compute parent path', parent.path, slug);
          hook.data.path = path.join(parent.path, slug);
        } else {
          debug('Parent path undefined', parent);
          throw new Error('Parent path undefined');
        }
        return hook;
      });
    }
  };
}

// check whether there is any folder children
function hasFolderishChild(hook, doc, options) {
  const folders = hook.app.service('folders');
  // only folder need to check hasFolderishChild
  if (doc.type === 'folder') {
    return folders.find({ query: {
      parent: doc.id
    }}).then(result => {
      let folderishChildren = filter(result.data, child => {
        return child.metadata.facets && child.metadata.facets.indexOf('Folderish') !== -1;
      });
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
    let bread = omit(parent, ['parent']);
    breadcrumbs = [bread, ...breadcrumbs];
    parent = parent.parent;
  }
  return breadcrumbs;
}

function getCollections(hook, doc, options) {
  const documents = hook.app.service('documents');
  const userCollections = hook.app.service('user-collections');
  return userCollections.find({
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
        return documents.find({
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
  const userFavorites = hook.app.service('user-favorites');
  return userFavorites.find({
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
  const getDocument = document.title
    ? Promise.resolve(document)
    : app.service('documents').get(document);
  return getDocument.then((doc) => {
    if (!doc.ACL) return null;
    
    let findUsers = Promise.resolve([]);
    let keys = fp.reject(fp.equals('*'), Object.keys(doc.ACL));
    const creators = fp.reject(fp.isNil, fp.map(fp.prop('creator'), Object.values(doc.ACL)));
    keys = keys.concat(creators);
    if (keys.length > 0) {
      findUsers = app.service('user-groups').find({ query: {
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
  if (!doc.ACL) return Promise.resolve(null);

  const inherited = doc.ACL['*'] && doc.ACL['*'].inherited === true;
  const getLocalAces = getAces(hook.app, doc);
  const getInheritedAces = getAces(hook.app, doc.parent);

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
    return Object.values(pick(Types, subtypes));
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
export function documentEnrichers(options = {}) {
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

// check whether there is any folder children
export function fetchBlobs(options) {
  return (hook) => {
    assert(hook.type === 'before', `fetchBlob must be used as a 'before' hook.`);

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }
 
    const blobs = hook.app.service('blobs');

    function getFullBlob(file) {
      // fetch only file is not fulfilled
      if (file && file.batch && !fp.isNil(file.index) && !(file.key || file.url)) {
        return blobs.get(file.batch).then(batch => {
          let blob = batch.blobs.find(b => b.index === parseInt(file.index));
          return Object.assign(file, blob);
        });
      }
      return Promise.resolve(file);
    }

    let promises = [];

    if (hook.data.file) {
      const getFileBlob = getFullBlob(hook.data.file).then(blob => {
        debug('getFullBlob file', blob);
        hook.data.file = blob;
      });
      promises.push(getFileBlob);
    }
    
    if (hook.data.files) {
      const getFilesBlob = Promise.all(hook.data.files.map(file => getFullBlob(file)))
        .then(blobs => {
          debug('getFullBlob files', blobs);
          hook.data.files = blobs;
        });
    }

    return Promise.all(promises).then(results => {
      debug('fetchBlob hook.data', hook.data, results);
      return hook;
    });
  };
}