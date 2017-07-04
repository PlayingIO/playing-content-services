import assert from 'assert';
import { hooks as auth } from 'feathers-authentication';
import { filter, kebabCase } from 'lodash';
import { hooks } from 'mostly-feathers-mongoose';
import path from 'path';

export function computePath(options = { slug: false }) {
  return hook => {
    const folders = hook.app.service('folders');

    // get parent or root
    const parentQuery = hook.data.parent
      ? folders.get(hook.data.parent)
      : folders.first({ query: { path : '/' } });

    return parentQuery.then(parent => {
      hook.data.parent = parent.id;
      hook.data.path = path.join(parent.path, options.slug? kebabCase(hook.data.title) : hook.data.id);
      return hook;
    });
  };
}

export function hasFolderishChild() {
  return hook => {
    assert(hook.type === 'after', `Must be used as a 'after' hook.`);

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }

    const folders = hook.app.service('folders');
    let results = Array.concat([], hook.result.data || hook.result);

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
