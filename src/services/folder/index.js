import { beforeHook, afterHook } from './hooks';
import memory from 'feathers-memory';
import FolderService from './service';

export default function(app) {
  // initialize service
  const service = new FolderService();
  app.use('folders', service);

  // service hooks
  app.service('folders').hooks({
    before: beforeHook,
    after: afterHook
  });

  // root folder
  const folders = app.service('folders');
  folders.first({ query: {
    path: '/'
  }}).then(result => {
    if (!result) {
      return folders.create({
        title: 'Root',
        color: '#000000',
        path: '/'
      });
    }
  }).catch(console.error);

}
