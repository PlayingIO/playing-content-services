import { hooks } from 'mostly-feathers-mongoose';
import BatchEntity from '~/entities/batch-entity';
import BlobEntity from '~/entities/blob-entity';

const presentEntity = (options = {}) => {
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

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options)
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
        presentEntity(options),
        hooks.responder()
      ]
    }
  };
};