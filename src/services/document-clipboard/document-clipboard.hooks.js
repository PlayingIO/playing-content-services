import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        cache(options.cache)
      ],
      patch: [
        hooks.addRouteObject('primary', { service: 'documents', headers: { 'enrichers-document': 'subtypes' } })
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