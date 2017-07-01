import { beforeHook, afterHook } from './hooks';
import memory from 'feathers-memory';
import DocumentService from './service';

export default function(app) {
  // initialize service
  const service = new DocumentService();
  app.use('documents', service);

  // service hooks
  app.service('documents').hooks({
    before: beforeHook,
    after: afterHook
  });

}
