import { hooks } from 'mostly-feathers-mongoose';

module.exports = function(options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options)
      ]
    },
    after: {
      all: [
        hooks.responder()
      ]
    }
  };
};