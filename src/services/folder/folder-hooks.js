import assert from 'assert';
import { hooks as auth } from 'feathers-authentication';
import { filter, kebabCase } from 'lodash';
import { hooks } from 'mostly-feathers-mongoose';
import path from 'path';
import * as content from '../content-hooks';
import FolderEntity from '~/entities/folder-entity';

module.exports = {
  before: {
    all: [
      auth.authenticate('jwt')
    ],
    create: [
      content.computePath({ slug: true })
    ],
    update: [
      content.computePath({ slug: true })
    ],
    patch: [
      content.computePath({ slug: true })
    ],
  },
  after: {
    all: [
      hooks.populate('parent', { service: 'folders' }),
      hooks.presentEntity(FolderEntity),
      content.hasFolderishChild(),
      hooks.responder()
    ]
  }
};
