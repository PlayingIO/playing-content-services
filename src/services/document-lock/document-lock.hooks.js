import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      create: [
        hooks.addRouteObject('document', { service: 'documents' })
      ],
      remove: [
        hooks.addRouteObject('document', { service: 'documents' })
      ]
    },
    after: {
      all: [
        cache(options.cache),
        hooks.responder()
      ]
    }
  };
}