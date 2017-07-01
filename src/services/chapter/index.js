import { beforeHook, afterHook } from './hooks';
import memory from 'feathers-memory';
import ChapterService from './service';

export default function(app) {
  // initialize service
  const service = new ChapterService();
  app.use('chapters', service);

  // service hooks
  app.service('chapters').hooks({
    before: beforeHook,
    after: afterHook
  });

}
