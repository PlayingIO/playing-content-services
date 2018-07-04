import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import { getMetaSubtypes, copyDocument, moveDocument } from '../../helpers';
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
      case 'copyDocument': return this.copy(id, data, params);
      case 'moveDocument': return this.move(id, data, params);
      default: throw new Error(`Unknown action method ${id}`);
    }
  }

  /**
   * Copy document as target document's children
   */
  async copy (id, data, params) {
    const target = params.primary;
    assert(target && target.id, 'target is not exists');
    assert(data.documents, 'documents is not provided.');
    assert(data.target, 'target is not provided.');
    debug('copyDocument target', target.id, data.documents);

    // subtypes of target
    const subtypes = getMetaSubtypes(target);

    const svcDocuments = this.app.service('documents');
    const copyDoc = async (id) => {
      const doc = await svcDocuments.get(id);
      if (fp.contains(doc.type, subtypes)) {
        return copyDocument(this.app, doc, target.id);
      } else {
        throw new Error('Target not allow doc type ' + doc.type);
      }
    };

    return Promise.all(data.documents.map(copyDoc));
  }

  /**
   * Move document to target document's children
   */
  async move (id, data, params) {
    const target = params.primary;
    assert(target && target.id, 'target is not exists');
    assert(data.documents, 'documents is not provided.');
    assert(data.target, 'target is not provided.');
    debug('moveDocument target', target.id, data.documents);

    // subtypes of target
    const subtypes = getMetaSubtypes(target);

    const svcDocuments = this.app.service('documents');
    const moveDoc = async (id) => {
      const doc = await svcDocuments.get(id);
      if (fp.contains(doc.type, subtypes)) {
        return moveDocument(this.app, doc, target.id);
      } else {
        throw new Error('Target not allow doc type ' + doc.type);
      }
    };

    return Promise.all(data.documents.map(moveDoc));
  }
}

export default function init (app, options, hooks) {
  return new DocumentClipboardService(options);
}

init.Service = DocumentClipboardService;
