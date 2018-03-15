import { hooks } from 'mostly-feathers-mongoose';
import AuthorEntity from '~/entities/author-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth)
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