import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import * as content from '~/hooks';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        hooks.authorize('document'),
        cache(options.cache, { headers: ['enrichers-document'] })
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
        cache(options.cache, { headers: ['enrichers-document'] }),
        iff(content.isDocumentType('document'),
          content.presentDocument(options)),
        hooks.responder()
      ],
      create: [
        iff(content.isDocumentType('document'),
          hooks.publishEvent('document.created', { prefix: 'playing' }))
      ]
    }
  };
}