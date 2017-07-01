import { beforeHook, afterHook } from './hooks';
import memory from 'feathers-memory';
import SubjectService from './service';

export default function(app) {
  // initialize service
  const service = new SubjectService();
  app.use('subjects', service);

  // service hooks
  app.service('subjects').hooks({
    before: beforeHook,
    after: afterHook
  });

}
