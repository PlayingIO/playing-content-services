import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import path from 'path';
import { plural } from 'pluralize';

import defaultHooks from './document-lock.hooks';

const debug = makeDebug('playing:content-services:documents/locks');

const defaultOptions = {
  name: 'documents/locks'
};

export class DocumentLockService {
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
  create (data, params) {
    const doc = params.document;
    assert(doc, 'document is not exists');
    const svcDocument = this.app.service(plural(doc.type));
    return svcDocument.patch(doc.id, {
      locker: data.creator,
      lockedAt: new Date()
    });
  }

  /**
   * Unlock document
   */
  remove (id, params) {
    const doc = params.document;
    assert(doc, 'document is not exists');
    const svcDocument = this.app.service(plural(doc.type));
    return svcDocument.patch(doc.id, {
      locker: null,
      lockedAt: null
    });
  }
}

export default function init (app, options, hooks) {
  return new DocumentLockService(options);
}

init.Service = DocumentLockService;
