import assert from 'assert';
import { filter, kebabCase } from 'lodash';
import path from 'path';
import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import { queryWithCurrentUser, restrictToOwner } from 'feathers-authentication-hooks';
import { config } from 'common';
import { entities } from '~/models';

const autoPath = hook => {
  const folders = hook.app.service('folders');

  // get parent or root
  const parentQuery = hook.data.parent
    ? folders.get(hook.data.parent)
    : folders.first({ query: { path : '/' } });

  return parentQuery.then(parent => {
    hook.data.parent = parent._id;
    hook.data.path = path.join(parent.path, kebabCase(hook.data.title));
    return hook;
  });
};

const hasFolderishChild = hook => {
  assert(hook.type === 'after', `Must be used as a 'after' hook.`);

  // If it was an internal call then skip this hook
  if (!hook.params.provider) {
    return hook;
  }

  const folders = hook.app.service('folders');
  let results = Array.concat([], hook.result.data || hook.result);

  function folderishChild(doc) {
    return folders.find({ query: {
      parent: doc._id
    }}).then(result => {
      let folderishChildren = filter(result.data, child => {
        return child.metadata.facets && child.metadata.facets.indexOf('Folderish') !== -1;
      });
      doc.metadata.hasFolderishChild = folderishChildren.length > 0;
      return doc;
    });
  }
  return Promise.all(results.map(folderishChild)).then(results => hook);
};

export const beforeHook = {
  all: [
    auth.authenticate('jwt')
  ],
  find: [],
  get: [],
  create: [ autoPath ],
  update: [ autoPath ],
  patch: [ autoPath ],
  remove: []
};

export const afterHook = {
  all: [
    hooks.populate('parent', { service: 'folders' }),
    hooks.presentEntity(entities.Folder),
    hasFolderishChild,
    hooks.responder()
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};