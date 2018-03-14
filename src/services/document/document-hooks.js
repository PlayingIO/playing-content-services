import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cacheMap } from 'mostly-utils-common';
import * as content from '~/hooks';

const cache = cacheMap({ max: 100 });

module.exports = function(options = {}) {
  const authOptions = Object.assign({}, options, {
    permissionField: 'permissions,groups.group.permissions,*'
  });
  return {
    before: {
      all: [
        hooks.authenticate('jwt', authOptions),
        hooks.authorize('document'),
        hooks.cache(cache)
      ],
      get: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      find: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      create: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        content.computePath(),
        content.computeAncestors(),
        content.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      update: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('id', 'metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath(),
        content.computeAncestors(),
        content.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      patch: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('id', 'metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath(),
        content.computeAncestors(),
        content.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ]
    },
    after: {
      all: [
        // only populate with document type to avoid duplicated process
        iff(content.isDocumentType('document'),
          hooks.populate('parent', { service: 'folders' })),
        iff(content.isDocumentType('document'),
          hooks.populate('ancestors')), // with typed id
        iff(content.isDocumentType('document'),
          hooks.populate('creator', { service: 'users' })),
        iff(content.isDocumentType('document'),
          hooks.assoc('permissions', { service: 'user-permissions', field: 'subject', typeField: 'type' })),
        iff(content.isDocumentType('document'),
          content.documentEnrichers(options)),
        hooks.cache(cache),
        iff(content.isDocumentType('document'),
          content.presentDocument(options)),
        hooks.responder()
      ],
      create: [
        iff(content.isDocumentType('document'),
          hooks.publishEvent('document.create', { prefix: 'playing' }))
      ]
    }
  };
};