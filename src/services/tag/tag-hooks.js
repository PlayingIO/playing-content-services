import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import TagEntity from '~/entities/tag-entity';

module.exports = {
  before: {
    all: [
      auth.authenticate('jwt')
    ]
  },
  after: {
    all: [
      hooks.presentEntity(TagEntity),
      hooks.responder()
    ]
  }
};
