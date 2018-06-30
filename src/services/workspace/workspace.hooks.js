import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import contents from 'playing-content-common';

import * as content from '../../hooks';

export default function (options = {}) {
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
}