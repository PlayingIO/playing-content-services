import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import contents from 'playing-content-common';
import { FileEntity } from 'playing-content-common';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache, { headers: ['enrichers-document'] })
      ],
      get: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      find: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        contents.computePath({ type: 'file' }),
        contents.computeAncestors(),
        contents.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      update: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        contents.computePath({ type: 'file' }),
        contents.computeAncestors(),
        contents.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      patch: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        contents.computePath({ type: 'file' }),
        contents.computeAncestors(),
        contents.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'folders', fallThrough: ['headers'] }),
        hooks.populate('ancestors'), // with typed id
        hooks.populate('creator', { service: 'users' }),
        contents.documentEnrichers(options),
        cache(options.cache, { headers: ['enrichers-document'] }),
        hooks.presentEntity(FileEntity, options.entities),
        hooks.responder()
      ],
      create: [
        contents.documentNotifier('document.create')
      ]
    }
  };
}