import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import path from 'path';
import { plural } from 'pluralize';

import defaultHooks from './document-hooks';
import { subDocumentEvents } from './document-events';
import { getParentAces } from '../../helpers';
import DocumentModel from '../../models/document-model';

const debug = makeDebug('playing:content-services:documents');

const defaultOptions = {
  name: 'documents'
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
    subDocumentEvents(this.app, this.options);
  }

  find(params = {}) {
    const type = fp.dotPath('query.type', params);
    if (type && fp.is(String, type)) {
      return this.app.service(plural(type)).find(params);
    } else {
      return super.find(params).then(result => {
        return helpers.discriminatedFind(this.app, 'document', result, params, this.options);
      });
    }
  }

  get(id, params = {}) {
    const type = fp.dotPath('query.type', params);
    if (type && fp.is(String, type)) {
      return this.app.service(plural(type)).get(id, params);
    } else {
      return super.get(id, params).then(doc => {
        return helpers.discriminatedGet(this.app, 'document', doc, params);
      });
    }
  }

  create(data, params = {}) {
    if (data.type && fp.is(String, data.type)) {
      return this.app.service(plural(data.type)).create(data, params);
    } else {
      return super.create(data, params);
    }
  }

  update(id, data, params = {}) {
    if (data.type && fp.is(String, data.type)) {
      return this.app.service(plural(data.type)).update(id, data, params);
    } else {
      return super.update(id, data, params);
    }
  }

  patch(id, data, params = {}) {
    if (data.type && fp.is(String, data.type)) {
      return this.app.service(plural(data.type)).patch(id, data, params);
    } else {
      return super.patch(id, data, params);
    }
  }

  remove(id, params = {}) {
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

  _tag(id, data, params, doc) {
    assert(data.tags, 'data.tags not provided.');

    const svcTags = this.app.service('tags');

    let tags = fp.union(doc.tags || [], data.tags);
    return Promise.all([
      super.patch(doc.id, { tags }, params),
      data.tags.map((tag) => svcTags.action('upsert').create({
        id: tag.toLowerCase(),
        label: tag
      }))
    ]).then(([docs, tags]) => docs);
  }

  _untag(id, data, params, doc) {
    assert(data.tags, 'data.tags not provided.');

    let tags = fp.without(data.tags, doc.tags || []);
    return super.patch(doc.id, { tags }, params);
  }

  _copyDocument(id, data, params, target) {
    assert(data.documents, 'data.documents not provided.');
    assert(data.target, 'data.target not provided.');
    debug('copyDocument target', target.id, data.documents);

    const copyDoc = (id) => {
      return this.get(id).then((doc) => {
        let service = plural(doc.type || 'document');
        let clone = fp.omit(['id', 'metadata', 'parent', 'path', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'], doc);
        clone.parent = target.id;
        return this.app.service(service).create(clone);
      });
    };

    return Promise.all(data.documents.map(copyDoc));
  }

  _moveDocument(id, data, params, target) {
    assert(data.documents, 'data.documents not provided.');
    assert(data.target, 'data.target not provided.');
    debug('moveDocument target', target.id, data.documents);

    const moveDoc = (id) => {
      return this.get(id).then((doc) => {
        let service = plural(doc.type || 'document');
        let data = {
          parent: target.id,
          path: path.resolve(target.path, path.basename(doc.path)),
          type: doc.type
        };
        return this.app.service(service).patch(doc.id, data);
      });
    };

    return Promise.all(data.documents.map(moveDoc));
  }

  _lockDocument(id, data, params, doc) {
    return super.patch(doc.id, {
      locker: data.creator,
      lockedAt: new Date()
    });
  }

  _unlockDocument(id, data, params, doc) {
    return super.patch(doc.id, {
      locker: null,
      lockedAt: null
    });
  }

  _addPermission(id, data, params, doc) {
    assert(doc, 'target document is not exists.');
    assert(data.actions, 'data.actions is not provided.');
    assert(data.user, 'data.user is not provided.');

    const svcPermissions = this.app.service('user-permissions');
    return svcPermissions.create({
      actions: fp.is(Array, data.actions)? data.actions : [data.actions],
      subject: `${doc.type}:${doc.id}`,
      user: data.user,
      role: data.role,
      creator: params.user.id,
      begin: data.begin,
      end: data.end
    });
  }

  _replacePermission(id, data, params, doc) {
    assert(doc, 'target document is not exists.');
    assert(data.ace, 'data.id is not provided.');
    assert(data.actions, 'data.action is not provided.');
    assert(data.user, 'data.user is not provided.');

    const svcPermissions = this.app.service('user-permissions');
    return svcPermissions.patch(data.ace, {
      actions: fp.is(Array, data.actions)? data.actions : [data.actions],
      user: data.user,
      role: data.role,
      begin: data.begin,
      end: data.end
    });
  }

  _removePermission(id, data, params, doc) {
    assert(doc, 'target document is not exists.');
    assert(data.ace, 'data.ace is not provided');

    const svcPermissions = this.app.service('user-permissions');
    return svcPermissions.remove(data.ace);
  }

  _blockPermissionInheritance(id, data, params, doc) {
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

  _unblockPermissionInheritance(id, data, params, doc) {
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

export default function init(app, options) {
  options = Object.assign({ ModelName: 'document' }, options);
  return createService(app, DocumentService, DocumentModel, options);
}

init.Service = DocumentService;
