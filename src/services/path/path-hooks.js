import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import SubjectEntity from '~/entities/subject-entity';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        auth.authenticate('jwt')
      ]
    },
    after: {
      all: [
        hooks.responder()
      ]
    }
  };
};