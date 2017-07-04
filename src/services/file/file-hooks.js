import assert from 'assert';
import { hooks as auth } from 'feathers-authentication';
import { filter, kebabCase } from 'lodash';
import { hooks } from 'mostly-feathers-mongoose';
import path from 'path';
import * as content from '../content-hooks';

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
      content.presentEntity(),
      content.hasFolderishChild(),
      hooks.responder()
    ]
  }
};
