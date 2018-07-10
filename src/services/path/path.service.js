const makeDebug = require('debug');
const fp = require('mostly-func');
const path = require('path');
const { plural } = require('pluralize');

const defaultHooks = require('./path.hooks');

const debug = makeDebug('playing:content-services:paths');

const defaultOptions = {
  name: 'paths'
};

// Path proxy service to documents
class PathService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  async find (params) {
    params = { query: {}, ...params };
    params.query.path = '/';

    const svcFolders = this.app.service('folders');
    return svcFolders.get(null, params);
  }

  async get (id, params) {
    params = { query: {}, ...params };
    const name = '/' + path.join(id || '', params.action || '');
    params.query.path = name;
    delete params.action;

    let type = params.query.type;
    const basename = path.basename(name);
    if (!type && basename.indexOf('-') > 0) {
      type = fp.head(basename.split('-'));
    }

    // get by path even if the document is destroyedAt
    params.$soft = true;
    let service = this.app.service(plural(type || 'document'));
    return service.get(null, params);
  }
}

module.exports = function init (app, options, hooks) {
  return new PathService(options);
};
module.exports.Service = PathService;
