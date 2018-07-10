const { queryWithCurrentUser } = require('feathers-authentication-hooks');
const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        queryWithCurrentUser({ idField: 'id', as: 'creator' }),
        cache(options.cache, { headers: ['enrichers-document'] })
      ]
    },
    after: {
      all: [
        //contents.addMetadata('facets', ['HiddenInNavigation']),
        cache(options.cache, { headers: ['enrichers-document'] }),
        hooks.responder()
      ]
    }
  };
};