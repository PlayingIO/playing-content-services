const makeDebug = require('debug');
const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const FolderModel = require('../../models/folder.model');
const defaultHooks = require('./folder.hooks');

const debug = makeDebug('playing:content-services:folders');

const defaultOptions = {
  name: 'folders'
};

class FolderService extends Service {
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
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'folder', ...options };
  return createService(app, FolderService, FolderModel, options);
};
module.exports.Service = FolderService;
