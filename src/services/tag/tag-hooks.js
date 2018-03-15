import { hooks } from 'mostly-feathers-mongoose';
import TagEntity from '~/entities/tag-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth)
      ]
    },
    after: {
      all: [
        hooks.presentEntity(TagEntity, options),
        hooks.responder()
      ]
    }
  };
};