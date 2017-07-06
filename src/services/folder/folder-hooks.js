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
      content.computePath({ slug: true })
    ],
    patch: [
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
