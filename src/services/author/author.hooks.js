import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import { AuthorEntity } from 'playing-content-common';

export default function (options = {}) {
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
        hooks.presentEntity(AuthorEntity, options.entities),
        hooks.responder()
      ]
    }
  };
}