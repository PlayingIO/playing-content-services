import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import TagEntity from '../../entities/tag.entity';

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
        hooks.presentEntity(TagEntity, options.entities),
        hooks.responder()
      ]
    }
  };
}