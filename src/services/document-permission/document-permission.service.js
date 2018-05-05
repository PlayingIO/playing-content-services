import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultHooks from './document-permission.hooks';

const debug = makeDebug('playing:content-services:documents/permissions');

const defaultOptions = {
  name: 'documents/permissions'
};

export class DocumentPermissionService {
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
  return new DocumentPermissionService(options);
}

init.Service = DocumentPermissionService;
