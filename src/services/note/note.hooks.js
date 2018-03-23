import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import NoteEntity from '~/entities/note.entity';
import * as content from '~/hooks';

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
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        content.computePath({ type: 'note' }),
        content.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      update: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('id', 'metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath({ type: 'note' }),
        content.computeAncestors(),
        content.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      patch: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('id', 'metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath({ type: 'note' }),
        content.computeAncestors(),
        content.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'folders', fallThrough: ['headers'] }),
        hooks.populate('ancestors'), // with typed id
        hooks.populate('creator', { service: 'users' }),
        content.documentEnrichers(options),
        cache(options.cache, { headers: ['enrichers-document'] }),
        hooks.presentEntity(NoteEntity, options),
        hooks.responder()
      ],
      create: [
        hooks.publishEvent('document.create', { prefix: 'playing' })
      ]
    }
  };
}