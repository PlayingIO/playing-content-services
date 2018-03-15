import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import path from 'path';
import { plural } from 'pluralize';

import defaultHooks from './workspace-hooks';

const debug = makeDebug('playing:content-services:workspaces');

const defaultOptions = {
  name: 'workspaces'
};

// user personal workspace folder
class WorkspaceService {
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
    this.name = options.name;
    this.options = options;
  }

  setup(app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  _getUserWorkspace(params) {
    assert(params.query.creator, 'params.query.creator not provided');
    const workspace = '/workspaces/folder-' + params.user.username;
    params.query.path = workspace;

    const svcFolders = this.app.service('folders');
    return svcFolders.action('first').find(params).then((result) => {
      // create own workspace if not exists
      if (result && result.data) {
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

  find(params) {
    params = fp.assign({ query: {} }, params);
    return this._getUserWorkspace(params).then(workspace => {
      return [workspace && workspace.data];
    });
  }

  get(id, params) {
    params = fp.assign({ query: {} }, params);
    return this._getUserWorkspace(params);
  }
}

export default function init (app, options, hooks) {
  return new WorkspaceService(options);
}

init.Service = WorkspaceService;
