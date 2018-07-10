const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');

const defaultHooks = require('./trash.hooks');

const debug = makeDebug('playing:content-services:trashes');

const defaultOptions = {
  name: 'trashes'
};

/**
 * Trashed documents service
 */
class TrashService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * Find all trashed documents
   */
  async find (params) {
    params = { query: {}, ...params };
    params.query.destroyedAt = { $ne: null };

    const svcDocuments = this.app.service('documents');
    return svcDocuments.find(params);
  }

  /**
   * Get all trashed documents under a Folderish parent
   */
  async get (id, params) {
    assert(id, 'id is not provided');
    params = { query: {}, ...params };
    params.query.parent = id;
    params.query.destroyedAt = { $ne: null };

    // TODO: hide trashed children?
    const svcDocuments = this.app.service('documents');
    return svcDocuments.find(null, params);
  }
}

module.exports = function init (app, options, hooks) {
  return new TrashService(options);
};
module.exports.Service = TrashService;
