import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';

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
      hooks.responder()
    ]
  }
};
