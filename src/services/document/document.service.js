import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import { plural } from 'pluralize';

import defaultHooks from './document.hooks';
import DocumentModel from '../../models/document.model';

const debug = makeDebug('playing:content-services:documents');

const defaultOptions = {
  name: 'documents',
  sort: {
    'position': 1,
    'createdAt': -1
  }
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

  async find (params = {}) {
    const type = fp.dotPath('query.type', params);
    if (type && fp.is(String, type)) {
      return this.app.service(plural(type)).find(params);
    } else {
      return super.find(params).then(result => {
        return helpers.discriminatedFind(this.app, 'document', result, params, this.options);
      });
    }
  }

  async get (id, params = {}) {
    const type = fp.dotPath('query.type', params);
    if (type && fp.is(String, type)) {
      return this.app.service(plural(type)).get(id, params);
    } else {
      const doc = await super.get(id, params);
      return helpers.discriminatedGet(this.app, 'document', doc, params);
    }
  }

  async create (data, params = {}) {
    if (data.type && fp.is(String, data.type)) {
      return this.app.service(plural(data.type)).create(data, params);
    } else {
      return super.create(data, params);
    }
  }

  async update (id, data, params = {}) {
    if (data.type && fp.is(String, data.type)) {
      return this.app.service(plural(data.type)).update(id, data, params);
    } else {
      return super.update(id, data, params);
    }
  }

  async patch (id, data, params = {}) {
    if (data.type && fp.is(String, data.type)) {
      return this.app.service(plural(data.type)).patch(id, data, params);
    } else {
      return super.patch(id, data, params);
    }
  }

  async remove (id, params = {}) {
    const type = fp.dotPath('query.type', params);
    if (type && fp.is(String, type)) {
      // delete all children by path
      const children = await this._queryWithChildren([id], params);
      return this.app.service(plural(type)).remove(null, {
        ...children,
        $multi: true
      });
    } else {
      const more = params && fp.dotPath('query.more', params);
      if (more) {
        const moreIds = [id].concat(more.split(','));
        delete params.query.more;
        const children = await this._queryWithChildren(moreIds, params);
        return super.remove(null, {
          ...children,
          $multi: true
        });
      } else {
        const children = await this._queryWithChildren([id], params);
        return super.remove(null, {
          ...children,
          $multi: true
        });
      }
    }
  }

  /**
   * query all children by path
   */
  async _queryWithChildren (ids, params) {
    const docs = await super.find({
      query: { _id: { $in: ids } },
      $soft: true,
      paginate: false
    });
    return {
      ...params,
      query: {
        ...params.query,
        $or: fp.map(doc => ({ path: { $regex: '^' + doc.path } }), docs)
      }
    };
  }

  /**
   * move positions of children documents
   */
  async move (id, data, params) {
    const parent = params.primary;
    assert(parent && parent.id, 'parent document is not exists.');
    assert(data.selects, 'selects is not provided.');
    assert(data.target, 'target is not provided.');
    data.selects = fp.asArray(data.selects);

    const isOrderable = parent.metadata && parent.metadata.facets && parent.metadata.facets.indexOf('Orderable');
    if (isOrderable < 0) {
      throw new Error('parent document is not manully sortable');
    }
    debug('move children documents', id, data.selects, data.target);
    const [target, selects] = await Promise.all([
      this.get(data.target),
      this.find({
        query: { id: { $in: data.selects } },
        paginate: false
      })
    ]);
    assert(target, 'target item is not exists');
    assert(selects && selects.length, 'selects item is not exists');

    return helpers.reorderPosition(this.Model, selects, target.position, {
      classify: 'parent'
    });
  }

  /**
   * Untrash a document
   */
  async restore (id, data, params = {}) {
    const document = params.primary;
    assert(document && document.id, 'document is not exists');
    const update = { destroyedAt: null };

    // TODO: restore all children?
    if (fp.isValid(document.position)) {
      update['position'] = null; // remove old position
      update['parent'] = document.parent; // must provided for recaculate position
    }
    return super.patch(id, update, params);
  }
}

export default function init (app, options) {
  options = { ModelName: 'document', ...options };
  return createService(app, DocumentService, DocumentModel, options);
}

init.Service = DocumentService;
