import assert from 'assert';
import { hooks as auth } from 'feathers-authentication';
import { filter, kebabCase } from 'lodash';
import { hooks } from 'mostly-feathers-mongoose';
import path from 'path';
import * as content from '../content-hooks';
import DocumentEntity from '~/entities/document-entity';

module.exports = {
  before: {
    all: [
      auth.authenticate('jwt')
    ],
    create: [
      content.computePath()
    ],
    update: [
      content.computePath()
    ],
    patch: [
      content.computePath()
    ],
  },
  after: {
    all: [
      hooks.populate('parent', { service: 'folders' }),
      hooks.presentEntity(DocumentEntity),
      content.hasFolderishChild(),
      hooks.responder()
    ]
  }
};
