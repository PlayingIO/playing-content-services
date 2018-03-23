import assert from 'assert';
import { Service, createService } from 'mostly-feathers-mongoose';

import FolderModel from '~/models/folder.model';
import defaultHooks from './folder.hooks';

const defaultOptions = {
  name: 'folders'
};

class FolderService extends Service {
  constructor (options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));

    // root folder
    this.action('first').find({ query: {
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
    this.action('first').find({ query: {
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
}

export default function init (app, options, hooks) {
  options = Object.assign({ ModelName: 'folder' }, options);
  return createService(app, FolderService, FolderModel, options);
}

init.Service = FolderService;
