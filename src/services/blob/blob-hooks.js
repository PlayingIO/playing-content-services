import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import BatchEntity from '~/entities/batch-entity';
import BlobEntity from '~/entities/blob-entity';

const presentEntity = options => hook => {
  if (hook.result.data) {
    hook.result.data = hook.result.data.map(doc => {
      return doc.blobs
        ? BatchEntity.parse(doc, options)
        : BlobEntity.parse(doc, options);
    });
  }
  else if (hook.result) {
    let doc = hook.result;
    hook.result = doc.blobs
      ? BatchEntity.parse(doc, options)
      : BlobEntity.parse(doc, options);
  }
  return hook;
};

module.exports = {
  before: {
    all: [
      auth.authenticate('jwt')
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
      presentEntity(),
      hooks.responder()
    ]
  }
};
