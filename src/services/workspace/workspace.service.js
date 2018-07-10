const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');
const slug = require('limax');

const defaultHooks = require('./workspace.hooks');

const debug = makeDebug('playing:content-services:workspaces');

const defaultOptions = {
  name: 'workspaces'
};

// user personal workspace folder
class WorkspaceService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  _getUserWorkspace (params) {
    assert(params.query.creator, 'query.creator not provided');
    const workspace = '/workspaces/folder-' + slug(params.user.username, { tone: false });
    params.query.path = workspace;

    const svcFolders = this.app.service('folders');
    return svcFolders.get(null, params).then((result) => {
      // create own workspace if not exists
      if (result) {
        return result;
      } else {
        return svcFolders.create({
          title: 'My Workspace',
          description: 'User workspace',
          creator: params.query.creator,
          path: workspace
        });
      }
    });
  }

  find (params) {
    params = { query: {}, ...params };
    return this._getUserWorkspace(params).then(workspace => {
      return [workspace && workspace.data];
    });
  }

  get (id, params) {
    params = { query: {}, ...params };
    return this._getUserWorkspace(params);
  }
}

module.exports = function init (app, options, hooks) {
  return new WorkspaceService(options);
};
module.exports.Service = WorkspaceService;
