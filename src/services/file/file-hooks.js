import { discard, iff, isProvider } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import FileEntity from '~/entities/file-entity';
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
        iff(isProvider('external'), discard('ACL')),
        hooks.populate('parent', { service: 'folders' }),
        hooks.populate('creator', { service: 'users' }),
        hooks.presentEntity(FileEntity, options),
        content.documentEnrichers(options),
        hooks.responder()
      ],
      create: [
        hooks.publishEvent('file.create', { prefix: 'playing' })
      ]
    }
  };
};