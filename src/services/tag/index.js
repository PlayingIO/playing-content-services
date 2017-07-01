import { beforeHook, afterHook } from './hooks';
import memory from 'feathers-memory';
import TagService from './service';

export default function(app) {
  // initialize service
  const service = new TagService();
  app.use('tags', service);

  // service hooks
  app.service('tags').hooks({
    before: beforeHook,
    after: afterHook
  });

}
