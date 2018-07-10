const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');
const { TagEntity } = require('playing-content-common');

module.exports = function (options = {}) {
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
        hooks.presentEntity(TagEntity, options.entities),
        hooks.responder()
      ]
    }
  };
};