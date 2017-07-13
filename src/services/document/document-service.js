import assert from 'assert';
import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';
import { plural } from 'pluralize';
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
    this.options.entities = app.get('entities');
    this.hooks(defaultHooks(this.options));
  }

  find(params) {
    if (params.type) {
      return this.app.service(plural(params.type)).find(params);
    } else {
      return super.find(params);
    }
  }

  get(id, params) {
    return super.get(id, params).then(doc => {
      if (doc && doc.type !== 'document') {
        let service = plural(doc.type || 'document');
        debug('proxy document get => ', service, doc.id);
        return this.app.service(service).get(doc.id, params);
      } else {
        return doc;
      }
    });
  }

  create(data, params) {
    if (params.type) {
      return this.app.service(plural(params.type)).create(data, params);
    } else {
      return super.create(data, params);
    }
  }

  update(id, data, params) {
    if (params.type) {
      return this.app.service(plural(params.type)).update(id, data, params);
    } else {
      return super.update(id, data, params);
    }
  }

  patch(id, data, params) {
    if (params.type) {
      return this.app.service(plural(params.type)).patch(id, data, params);
    } else {
      return super.patch(id, data, params);
    }
  }

  remove(id, data, params) {
    if (params.type) {
      return this.app.service(plural(params.type)).remove(id, data, params);
    } else {
      return super.remove(id, data, params);
    }
  }
}

export default function init(app, options) {
  options = Object.assign({ ModelName: 'document' }, options);
  return createService(app, DocumentService, DocumentModel, options);
}

init.Service = DocumentService;
