import makeDebug from 'debug';
import fp from 'mostly-func';
import path from 'path';
import { plural } from 'pluralize';

import defaultHooks from './path.hooks';

const debug = makeDebug('playing:content-services:paths');

const defaultOptions = {
  name: 'paths'
};

// Path proxy service to documents
export class PathService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  find (params) {
    params = { query: {}, ...params };
    params.query.path = '/';

    const svcFolders = this.app.service('folders');
    return svcFolders.get(null, params);
  }

  get (id, params) {
    params = { query: {}, ...params };
    const name = '/' + path.join(id || '', params.action || '');
    params.query.path = name;
    delete params.action;

    let type = params.query.type;
    const basename = path.basename(name);
    if (!type && basename.indexOf('-') > 0) {
      type = fp.head(basename.split('-'));
    }

    let service = this.app.service(plural(type || 'document'));
    return service.get(null, params);
  }
}

export default function init (app, options, hooks) {
  return new PathService(options);
}

init.Service = PathService;
