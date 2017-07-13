import makeDebug from 'debug';
import { join } from 'path';
import { plural } from 'pluralize';
import defaultHooks from './path-hooks';

const debug = makeDebug('playing:content-services:path');

// Path proxy service to documents
class PathService {
  constructor(options) {
    this.options = options;
  }

  setup(app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  find(params) {
    params = params || { query: {} };
    params.query.path = '/';

    const folders = this.app.service('folders');
    return folders.first({ query: { path: '/' } });
  }

  get(id, params) {
    params = params || { query: {} };
    let path = '/' + join(id || '', params.__action || '');
    params.query.path = path;
    delete params.__action;

    // optimized select only query
    return this.app.service('documents').first({ query: {
      path: path,
      $select: ['id', 'type']
    }}).then(doc => {
      if (doc) {
        let service = plural(doc.type || 'document');
        debug('proxy document get => ', service, doc.id);
        return this.app.service(service).get(doc.id, params);
      } else {
        return null;
      }
    });
  }
}

export default function init (options) {
  return new PathService(options);
}

init.Service = PathService;
