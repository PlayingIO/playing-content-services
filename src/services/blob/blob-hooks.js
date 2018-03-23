import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';

import BatchEntity from '~/entities/batch-entity';
import BlobEntity from '~/entities/blob-entity';

const presentBlob = (options = {}) => {
  return (hook) => {
    options.provider = hook.params.provider;

    if (hook.result) {
      if (hook.result.data) {
        hook.result.data = hook.result.data.map(doc => {
          return doc.blobs
            ? BatchEntity.parse(doc, options)
            : BlobEntity.parse(doc, options);
        });
      } else {
        let doc = hook.result;
        hook.result = doc.blobs
          ? BatchEntity.parse(doc, options)
          : BlobEntity.parse(doc, options);
      }
    }
    
    return hook;
  };
};

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