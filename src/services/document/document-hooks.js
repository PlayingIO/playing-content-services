import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import DocumentEntity from '~/entities/document-entity';

module.exports = {
  before: {
    all: [
      auth.authenticate('jwt')
    ]
  },
  after: {
    all: [
      hooks.presentEntity(DocumentEntity),
      hooks.responder()
    ]
  }
};
