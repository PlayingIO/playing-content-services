import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import path from 'path';
import { plural } from 'pluralize';

import defaultHooks from './document-clipboard.hooks';

const debug = makeDebug('playing:content-services:documents/clipboards');

const defaultOptions = {
  name: 'documents/clipboards'
};

export class DocumentClipboardService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * router to actions
   */
  async patch (id, data, params) {
    switch (id) {
      case 'copyDocument': return this.copyDocument(id, data, params);
      case 'moveDocument': return this.moveDocument(id, data, params);
      default: throw new Error(`Unknown action method ${id}`);
    }
  }

  /**
   * Copy document as target document's children
   */
  async copyDocument (id, data, params) {
    const target = params.target;
    assert(target, 'target is not exists');
    assert(data.documents, 'data.documents is not provided.');
    assert(data.target, 'data.target is not provided.');
    debug('copyDocument target', target.id, data.documents);

    const svcDocuments = this.app.service('documents');
    const copyDoc = async (id) => {
      const doc = await svcDocuments.get(id);
      const svcService = this.app.service(plural(doc.type || 'document'));
      let clone = fp.omit([
        'id', 'metadata', 'parent', 'path', 'ancestors',
        'createdAt', 'updatedAt', 'destroyedAt'
      ], doc);
      clone.parent = target.id;
      return svcService.create(clone);
    };

    return Promise.all(data.documents.map(copyDoc));
  }

  /**
   * Move document to target document's children
   */
  async moveDocument (id, data, params) {
    const target = params.target;
    assert(target, 'target is not exists');
    assert(data.documents, 'data.documents is not provided.');
    assert(data.target, 'data.target is not provided.');
    debug('moveDocument target', target.id, data.documents);

    const svcDocuments = this.app.service('documents');
    const moveDoc = async (id) => {
      const doc = await svcDocuments.get(id);
      const svcService = this.app.service(plural(doc.type || 'document'));
      const data = {
        parent: target.id,
        path: path.resolve(target.path, path.basename(doc.path)),
        type: doc.type
      };
      return svcService.patch(doc.id, data);
    };

    return Promise.all(data.documents.map(moveDoc));
  }
}

export default function init (app, options, hooks) {
  return new DocumentClipboardService(options);
}

init.Service = DocumentClipboardService;
