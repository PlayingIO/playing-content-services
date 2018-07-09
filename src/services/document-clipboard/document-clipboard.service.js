import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import path from 'path';
import { copyDocument, moveDocument, shortname, fanoutDocuments } from 'playing-content-common';

import defaultHooks from './document-clipboard.hooks';
import defaultJobs from './document-clipboard.jobs';

const debug = makeDebug('playing:content-services:documents/clipboards');

const defaultOptions = {
  name: 'documents/clipboards'
};

const getMetaSubtypes = (doc) => {
  return fp.map(
    type => type.type.toLowerCase(),
    doc.metadata && doc.metadata.subtypes || []
  );
};

export class DocumentClipboardService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
    defaultJobs(app, this.options);
  }

  /**
   * router to actions
   */
  async patch (id, data, params) {
    switch (id) {
      case 'copy': return this.copy(id, data, params);
      case 'move': return this.move(id, data, params);
      default: throw new Error(`Unknown action method ${id}`);
    }
  }

  /**
   * Copy document as target document's children
   */
  async copy (id, data, params) {
    const target = params.primary;
    assert(target && target.id && target.path, 'target is not exists');
    assert(data.documents, 'documents is not provided.');
    assert(data.target, 'target is not provided.');
    debug('copyDocument target', target.id, data.documents);

    const documents = await Promise.all(
      fp.map(doc => this._prepareDocument(doc, target), data.documents)
    );
    const results = await Promise.all(
      fp.map(doc => copyDocument(this.app, doc), documents)
    );

    // fanout for all children documents
    const targets = fp.pickFrom('id', 'path', documents);
    fanoutDocuments(this.app, documents, 'copyDocuments', targets);
  
    return results;
  }

  /**
   * Move document to target document's children
   */
  async move (id, data, params) {
    const target = params.primary;
    assert(target && target.id && target.path, 'target is not exists');
    assert(data.documents, 'documents is not provided.');
    assert(data.target, 'target is not provided.');
    debug('moveDocument target', target.id, data.documents);

    const documents = await Promise.all(
      fp.map(doc => this._prepareDocument(doc, target), data.documents)
    );
    const results = await Promise.all(
      fp.map(doc => moveDocument(this.app, doc), documents)
    );

    // fanout for all children documents
    const targets = fp.pickFrom('id', 'path', documents);
    fanoutDocuments(this.app, documents, 'moveDocuments', targets);
  
    return results;
  }

  async _prepareDocument (id, target) {
    const svcDocuments = this.app.service('documents');
    const subtypes = getMetaSubtypes(target);
    const document = await svcDocuments.get(id);

    if (fp.contains(document.type, subtypes)) {
      document.path = path.join(target.path, shortname(document.type));
      return document;
    } else {
      throw new Error('Target not allow doc type ' + document.type);
    }
  }
}

export default function init (app, options, hooks) {
  return new DocumentClipboardService(options);
}

init.Service = DocumentClipboardService;
