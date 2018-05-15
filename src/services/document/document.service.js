import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import { plural } from 'pluralize';

import defaultHooks from './document.hooks';
import DocumentModel from '../../models/document.model';
import { getParentAces } from '../../helpers';

const debug = makeDebug('playing:content-services:documents');

const defaultOptions = {
  name: 'documents'
};

export class DocumentService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.options.entities = app.get('entities');
    this.hooks(defaultHooks(this.options));
  }

  find (params = {}) {
    const type = fp.dotPath('query.type', params);
    if (type && fp.is(String, type)) {
      return this.app.service(plural(type)).find(params);
    } else {
      return super.find(params).then(result => {
        return helpers.discriminatedFind(this.app, 'document', result, params, this.options);
      });
    }
  }

  get (id, params = {}) {
    const type = fp.dotPath('query.type', params);
    if (type && fp.is(String, type)) {
      return this.app.service(plural(type)).get(id, params);
    } else {
      return super.get(id, params).then(doc => {
        return helpers.discriminatedGet(this.app, 'document', doc, params);
      });
    }
  }

  create (data, params = {}) {
    if (data.type && fp.is(String, data.type)) {
      return this.app.service(plural(data.type)).create(data, params);
    } else {
      return super.create(data, params);
    }
  }

  update (id, data, params = {}) {
    if (data.type && fp.is(String, data.type)) {
      return this.app.service(plural(data.type)).update(id, data, params);
    } else {
      return super.update(id, data, params);
    }
  }

  patch (id, data, params = {}) {
    if (data.type && fp.is(String, data.type)) {
      return this.app.service(plural(data.type)).patch(id, data, params);
    } else {
      return super.patch(id, data, params);
    }
  }

  remove (id, params = {}) {
    const type = fp.dotPath('query.type', params);
    if (type && fp.is(String, type)) {
      return this.app.service(plural(type)).remove(id, params);
    } else {
      const more = params && fp.dotPath('query.more', params);
      if (more) {
        const moreIds = [id].concat(more.split(','));
        delete params.query.more;
        return Promise.all(moreIds.map(id => super.remove(id, params)));
      } else {
        return super.remove(id, params);
      }
    }
  }

  blockPermissionInheritance (id, data, params, doc) {
    assert(doc, 'target document is not exists.');

    // copy inherited permissions
    const svcPermissions = this.app.service('user-permissions');
    return getParentAces(this.app, [doc], '*').then(inheritedAces => {
      if (inheritedAces && inheritedAces[doc.id]) {
        return Promise.all(fp.map(ace => {
          ace.subject = `${doc.type}:${doc.id}`;
          ace.creator = params.user.id;
          return svcPermissions.create(ace);
        }, inheritedAces[doc.id]));
      }
    }).then(results => {
      return super.patch(id, { inherited: false }, params);
    });
  }

  unblockPermissionInheritance (id, data, params, doc) {
    assert(doc, 'target document is not exists.');

    // remove copied permissions
    const svcPermissions = this.app.service('user-permissions');
    return getParentAces(this.app, [doc], '*').then(inheritedAces => {
      if (inheritedAces && inheritedAces[doc.id]) {
        return Promise.all(fp.map(ace => {
          return svcPermissions.remove(null, {
            query: {
              actions: ace.actions,
              subject: `${doc.type}:${doc.id}`,
              user: ace.user,
              role: ace.role,
              creator: params.user.id
            },
            $multi: true
          });
        }, inheritedAces[doc.id]));
      }
    }).then(results => {
      return super.patch(id, { inherited: true }, params);
    });
  }
}

export default function init (app, options) {
  options = { ModelName: 'document', ...options };
  return createService(app, DocumentService, DocumentModel, options);
}

init.Service = DocumentService;
