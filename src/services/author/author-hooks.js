import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import AuthorEntity from '~/entities/author-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ]
    },
    after: {
      all: [
        cache(options.cache),
        hooks.presentEntity(AuthorEntity, options),
        hooks.responder()
      ]
    }
  };
};