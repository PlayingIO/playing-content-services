import { remove } from 'feathers-hooks-common';
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
      remove('id', 'metadata', 'createdAt', 'updatedAt', 'destroyedAt'),
      content.computePath({ slug: true })
    ],
    patch: [
      hooks.depopulate('parent'),
      remove('id', 'metadata', 'createdAt', 'updatedAt', 'destroyedAt'),
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
