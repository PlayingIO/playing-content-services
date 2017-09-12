import makeDebug from 'debug';
import fp from 'mostly-func';
import { join } from 'path';
import { plural } from 'pluralize';
import path from 'path';
import defaultHooks from './path-hooks';

const debug = makeDebug('playing:content-services:path');

const defaultOptions = {
  name: 'paths'
};

// Path proxy service to documents
class PathService {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
    this.name = options.name;
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
    return folders.action('first').find(params);
  }

  get(id, params) {
    params = params || { query: {} };
    const name = '/' + join(id || '', params.__action || '');
    params.query.path = name;
    delete params.__action;

    let type = params.query.type;
    const basename = path.basename(name);
    if (!type && basename.indexOf('-') > 0) {
      type = fp.head(basename.split('-'));
    }

    let service = this.app.service(plural(type || 'document'));
    return service.action('first').find(params);
  }
}

export default function init (app, options, hooks) {
  return new PathService(options);
}

init.Service = PathService;
