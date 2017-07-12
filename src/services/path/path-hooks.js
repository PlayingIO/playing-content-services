import { hooks as auth } from 'feathers-authentication';
import { hooks } from 'mostly-feathers-mongoose';
import SubjectEntity from '~/entities/subject-entity';

module.exports = {
  before: {
    all: [
      auth.authenticate('jwt')
    ],
    get: [
      hook => console.log('##########path.get', hook)
    ]
  },
  after: {
    all: [
    ]
  }
};
