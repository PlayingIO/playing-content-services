import assert from 'assert';
import makeDebug from 'debug';
import { hooks as auth } from 'feathers-authentication';
import { filter, kebabCase } from 'lodash';
import { hooks } from 'mostly-feathers-mongoose';
import path from 'path';
import shortid from 'shortid';

import DocumentEntity from '~/entities/document-entity';
import FolderEntity from '~/entities/folder-entity';
import FileEntity from '~/entities/file-entity';

const debug = makeDebug('playing:content-services:hooks');

const defaultEntities = {
  document: DocumentEntity,
  folder: FolderEntity,
  file: FileEntity
};

// presentEntity by document type
export function presentEntity(entities = {}) {
  entities = Object.assign(defaultEntities, entities);

  return hook => {
    if (hook.result) {
      let options = { provider: hook.params.provider };
      if (hook.result.data) {
        hook.result.data = hook.result.data.map(doc => {
          if (doc.type && entities[doc.type]) {
            debug('Document type entity', doc.id, doc.type, options);
            return entities[doc.type].parse(doc, options);
          } else {
            debug('WARNING: Document type entity', doc.id, doc.type, 'not found in');
            debug('  =>', Object.keys(entities));
            return DocumentEntity.parse(doc, options);
          }
        });
      } else {
        let doc = hook.result;
        if (doc.type && entities[doc.type]) {
          debug('Document type entity', doc.id, doc.type, options);
          hook.result = entities[doc.type].parse(doc, options);
        } else {
          debug('WARNING: Document type entity', doc.id, doc.type, 'not found in');
          debug('  =>', Object.keys(entities));
          hook.result = DocumentEntity.parse(doc, options);
        }
      }
    }
    return hook;
  };
}

// compute current path by parent
export function computePath(options = { slug: false }) {
  return hook => {
    const folders = hook.app.service('folders');

    // get parent or root
    const parentQuery = hook.data.parent
      ? folders.get(hook.data.parent)
      : folders.first({ query: { path : '/' } });

    return parentQuery.then(parent => {
      if (parent && parent.path) {
        hook.data.parent = parent.id;
        let slug = 'untitled';
        if (options.slug) {
          if (hook.data.title && hook.data.title.length > 0) {
            slug = kebabCase(hook.data.title);
          }
        } else {
          slug = hook.data.path || shortid.generate();
        }
        debug('compute parent path', parent.path, slug);
        hook.data.path = path.join(parent.path, slug);
      } else {
        debug('Parent path undefined', parent);
        throw new Error('Parent path undefined');
      }
      return hook;
    });
  };
}

// check whether there is any folder children
export function hasFolderishChild() {
  return hook => {
    assert(hook.type === 'after', `hasFolderishChild must be used as a 'after' hook.`);

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }

    const folders = hook.app.service('folders');
    let results = Array.concat([], hook.result? hook.result.data || hook.result : []);

    function folderishChild(doc) {
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
    return Promise.all(results.map(folderishChild)).then(results => hook);
  };
}

// check whether there is any folder children
export function fetchBlobs(options) {
  return hook => {
    assert(hook.type === 'before', `fetchBlob must be used as a 'before' hook.`);

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }
 
    const blobs = hook.app.service('blobs');

    function getFullBlob(file) {
      // fetch only file is not fulfilled
      if (file && file.batch && file.index && !(file.key || file.url)) {
        return blobs.get(file.batch).then(batch => {
          let blob = batch.blobs.find(b => b.index === parseInt(file.index));
          return Object.assign(file, blob);
        });
      }
      return Promise.resolve(file);
    }

    let promises = {};
    
    promises.file = getFullBlob(hook.data.file).then(blob => {
      debug('getFullBlob file', blob);
      hook.data.file = blob;
    });

    promises.files = Promise.all((hook.data.files || []).map(file => getFullBlob(file)))
      .then(blobs => {
        debug('getFullBlob files', blobs);
        hook.data.files = blobs;
      });

    Promise.props(promises).then(results => {
      debug('fetchBlob hook.data', hook.data, results);
      return hook;
    });
  };
}