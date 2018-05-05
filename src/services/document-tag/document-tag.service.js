import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './document-tag.hooks';

const debug = makeDebug('playing:content-services:documents/tags');

const defaultOptions = {
  name: 'documents/tags'
};

export class DocumentTagService {
  constructor (options) {
    this.options = fp.assign(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }
}

export default function init (app, options, hooks) {
  return new DocumentTagService(options);
}

init.Service = DocumentTagService;
