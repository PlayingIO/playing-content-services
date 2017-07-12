import { discard } from 'feathers-hooks-common';
import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import * as content from '../content-hooks';

module.exports = {
  before: {
    all: [
      auth.authenticate('jwt')
    ],
    create: [
      content.computePath({ slug: true }),
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
      content.presentDocument(),
      content.hasFolderishChild(),
      hooks.responder()
    ]
  }
};
