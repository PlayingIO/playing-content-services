import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';
import DocumentModel from '~/models/document-model';
import defaultHooks from './document-hooks';

const debug = makeDebug('playing:content-services:documents');

const defaultOptions = {
  name: 'document-service'
};

class DocumentService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks);
  }

  removeFile(id, data, params, orignal) {
    return super.patch(id, { file: null }, params);
  }
}

export default function init(app, options) {
  options = Object.assign({ ModelName: 'document' }, options);
  return createService(app, DocumentService, DocumentModel, options);
}

init.Service = DocumentService;
