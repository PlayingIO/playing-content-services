const { iff } = require('feathers-hooks-common');
const { hooks } = require('mostly-feathers-mongoose');
const { cache } = require('mostly-feathers-cache');

const { presentBlob } = require('../../hooks');

module.exports = function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      create: [
      ],
      update: [
      ],
      patch: [
        iff(hooks.isAction('attachOnDocument'),
          hooks.addRouteObject('primary', { service: 'blobs', field: 'id' })),
        iff(hooks.isAction('removeFromDocument'),
          hooks.addRouteObject('primary', { service: 'blobs', field: 'id' }))
      ]
    },
    after: {
      all: [
        cache(options.cache),
        presentBlob(options),
        hooks.responder()
      ]
    }
  };
};