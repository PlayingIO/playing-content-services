import { beforeHook, afterHook } from './hooks';
import memory from 'feathers-memory';
import BookService from './service';

export default function(app) {
  // initialize service
  const service = new BookService();
  app.use('books', service);

  // service hooks
  app.service('books').hooks({
    before: beforeHook,
    after: afterHook
  });

}
