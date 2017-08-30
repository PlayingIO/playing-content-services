import { discard, iff } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import * as content from '../content-hooks';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt')
      ],
      get: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      find: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      create: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.defaultAcls('restrictToOwner', 'ReadWrite'),
        hooks.defaultAcls('restrictToPublic', 'Read'),
        hooks.defaultAcls('inheriteParent', true),
        content.computePath(),
        content.fetchBlobs()
      ],
      update: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('parent'),
        content.computePath(),
        discard('id', 'metadata', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.fetchBlobs()
      ],
      patch: [
        associateCurrentUser({ idField: 'id', as: 'creator' }),
        hooks.depopulate('parent'),
        content.computePath(),
        discard('id', 'metadata', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.fetchBlobs()
      ]
    },
    after: {
      all: [
        hooks.responder()
      ],
      find: [
        hooks.populate('parent', { service: 'folders' }),
        hooks.populate('creator', { service: 'users' }),
        content.documentEnrichers(options),
        content.presentDocument(options),
      ],
      get: [
        // only populate with document type to avoid duplicated process
        iff(content.isDocument(), hooks.populate('parent', { service: 'folders' })),
        iff(content.isDocument(), hooks.populate('creator', { service: 'users' })),
        iff(content.isDocument(), content.documentEnrichers(options)),
        iff(content.isDocument(), content.presentDocument(options)),
      ],
      create: [
        hooks.publishEvent('document.create', { prefix: 'playing' })
      ]
    }
  };
};