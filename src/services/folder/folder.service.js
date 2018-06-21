import assert from 'assert';
import makeDebug from 'debug';
import { Service, helpers, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import FolderModel from '../../models/folder.model';
import defaultHooks from './folder.hooks';

const debug = makeDebug('playing:content-services:folders');

const defaultOptions = {
  name: 'folders'
};

export class FolderService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));

    // root folder
    this.get(null, { query: {
      path: '/'
    }}).then(result => {
      if (!result) {
        return this.create({
          title: 'Root',
          color: '#000000',
          path: '/'
        });
      }
    }).catch(console.error);

    // workspaces folder
    this.get(null, { query: {
      path: '/workspaces'
    }}).then(result => {
      if (!result) {
        return this.create({
          title: 'Workspaces',
          color: '#555555',
          path: '/workspaces'
        });
      }
    }).catch(console.error);
  }

  /*
   * move positions of documents in the folder
   */
  async move (id, data, params) {
    assert(data.selects, 'data.selects is not provided.');
    assert(data.target, 'data.target is not provided.');
    data.selects = fp.asArray(data.selects);

    debug('move folder documents', id, data.selects, data.target);
    const svcDocuments = this.app.service('documents');
    const [target, selects] = await Promise.all([
      svcDocuments.get(data.target).
      svcDocuments.find({ id: { $in: data.selects } })
    ]);
    assert(target, 'target item is not exists');
    assert(selects && selects.length, 'selects item is not exists');

    return helpers.reorderPosition(this.Model, selects, target.position, {
      classify: 'parent'
    });
  }  
}

export default function init (app, options, hooks) {
  options = { ModelName: 'folder', ...options };
  return createService(app, FolderService, FolderModel, options);
}

init.Service = FolderService;
