import { beforeHook, afterHook } from './hooks';
import memory from 'feathers-memory';
import ResourceService from './service';

export default function(app) {
  // initialize service
  const service = new ResourceService();
  app.use('resources', service);

  // service hooks
  app.service('resources').hooks({
    before: beforeHook,
    after: afterHook
  });

}
