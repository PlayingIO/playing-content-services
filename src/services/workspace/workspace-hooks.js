import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { iff, isProvider } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import * as content from '~/hooks';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options),
        iff(isProvider('external'),
          queryWithCurrentUser({ idField: 'id', as: 'creator' })),
        cache(options.cache)
      ]
    },
    after: {
      all: [
        //content.addMetadata('facets', ['HiddenInNavigation']),
        cache(options.cache),
        hooks.responder()
      ]
    }
  };
};