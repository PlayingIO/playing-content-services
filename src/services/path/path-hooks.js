import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options),
        cache(options.cache)
      ]
    },
    after: {
      all: [
        cache(options.cache),
        hooks.responder()
      ]
    }
  };
};