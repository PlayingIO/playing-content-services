import { discard } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import FileEntity from '~/entities/file-entity';
import * as content from '../content-hooks';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt')
      ],
      create: [
        content.computePath(),
        content.fetchBlobs()
      ],
      update: [
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.fetchBlobs()
      ],
      patch: [
        hooks.depopulate('parent'),
        discard('id', 'metadata', 'path', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.fetchBlobs()
      ]
    },
    after: {
      all: [
        hooks.populate('parent', { service: 'folders' }),
        hooks.presentEntity(FileEntity, options),
        content.documentEnrichers(),
        hooks.responder()
      ]
    }
  };
};