import { iff } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import { presentBlob } from '../../hooks';

export default function (options = {}) {
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
}