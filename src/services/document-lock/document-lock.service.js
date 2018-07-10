const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');
const { plural } = require('pluralize');

const defaultHooks = require('./document-lock.hooks');

const debug = makeDebug('playing:content-services:documents/locks');

const defaultOptions = {
  name: 'documents/locks'
};

class DocumentLockService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * Lock document
   */
  async create (data, params) {
    const doc = params.primary;
    assert(doc && doc.id, 'document is not exists');
    const svcDocument = this.app.service(plural(doc.type));
    return svcDocument.patch(doc.id, {
      locker: data.creator,
      lockedAt: new Date()
    });
  }

  /**
   * Unlock document
   */
  async remove (id, params) {
    const doc = params.primary;
    assert(doc && doc.id, 'document is not exists');
    const svcDocument = this.app.service(plural(doc.type));
    return svcDocument.patch(doc.id, {
      locker: null,
      lockedAt: null
    });
  }
}

module.exports = function init (app, options, hooks) {
  return new DocumentLockService(options);
};
module.exports.Service = DocumentLockService;
