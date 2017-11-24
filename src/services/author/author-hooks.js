import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import AuthorEntity from '~/entities/author-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt')
      ]
    },
    after: {
      all: [
        hooks.presentEntity(AuthorEntity, options),
        hooks.responder()
      ]
    }
  };
};