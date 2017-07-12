import path from 'path';
import defaultHooks from './path-hooks';

// Path proxy service to documents
class PathService {
  constructor(options) {
  }

  setup(app) {
    this.app = app;
    this.hooks(defaultHooks);
  }

  find(params) {
    params = params || { query: {} };
    params.query.path = '/';

    const documents = this.app.service('documents');
    return documents.get(null, params);
  }

  get(id, params) {
    params = params || { query: {} };
    params.query.path = '/' + path.join(id, params.__action || '');
    delete params.__action;

    const documents = this.app.service('documents');
    return documents.get(null, params);
  }
}

export default function init (options) {
  return new PathService(options);
}

init.Service = PathService;
