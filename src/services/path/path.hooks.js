const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache, { headers: ['enrichers-document'] })
      ]
    },
    after: {
      all: [
        cache(options.cache, { headers: ['enrichers-document'] }),
        hooks.responder()
      ]
    }
  };
};