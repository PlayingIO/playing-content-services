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
      content.computePath({ slug: true })
    ],
    update: [
      hooks.depopulate('parent'),
      discard('id', 'metadata', 'createdAt', 'updatedAt', 'destroyedAt'),
      content.fetchBlobs(),
      content.computePath({ slug: true })
    ],
    patch: [
      hooks.depopulate('parent'),
      discard('id', 'metadata', 'createdAt', 'updatedAt', 'destroyedAt'),
      content.fetchBlobs(),
      content.computePath({ slug: true })
    ]
  },
  after: {
    all: [
      hooks.populate('parent', { service: 'folders' }),
      content.presentEntity(),
      content.hasFolderishChild(),
      hooks.responder()
    ]
  }
};
