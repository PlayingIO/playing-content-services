import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import { queryWithCurrentUser, restrictToOwner } from 'feathers-authentication-hooks';
import { config } from 'common';
import { entities } from '~/models';

export const beforeHook = {
  all: [
    auth.authenticate('jwt')
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

export const afterHook = {
  all: [
    hooks.populate('parent', { service: 'books' }),
    hooks.presentEntity(entities.Chapter),
    hooks.responder()
  ],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};