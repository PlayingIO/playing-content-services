import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import { plural } from 'pluralize';

import defaultHooks from './document-permission.hooks';
import { getParentAces } from '../../helpers';

const debug = makeDebug('playing:content-services:documents/permissions');

const defaultOptions = {
  name: 'documents/permissions'
};

export class DocumentPermissionService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  /**
   * Add document permission
   */
  async create (data, params) {
    const target = params.target;
    assert(target, 'target document is not exists.');
    assert(data.actions, 'data.actions is not provided.');
    assert(data.user, 'data.user is not provided.');

    const svcPermissions = this.app.service('user-permissions');
    return svcPermissions.create({
      actions: fp.asArray(data.actions),
      subject: `${target.type}:${target.id}`,
      user: data.user,
      role: data.role,
      creator: params.user.id,
      begin: data.begin,
      end: data.end
    });
  }

  /**
   * Replace document permissions
   */
  async patch (id, data, params) {
    // block/unblock inheritance
    if (id === 'blockInheritance') {
      return this.blockInheritance(id, data, params);
    }
    if (id === 'unblockInheritance') {
      return this.unblockInheritance(id, data, params);
    }

    const target = params.target;
    assert(target, 'target document is not exists.');
    assert(data.ace, 'data.id is not provided.');
    assert(data.actions, 'data.action is not provided.');
    assert(data.user, 'data.user is not provided.');

    const svcPermissions = this.app.service('user-permissions');
    return svcPermissions.patch(data.ace, {
      actions: fp.asArray(data.actions),
      user: data.user,
      role: data.role,
      begin: data.begin,
      end: data.end
    });
  }

  /**
   * Remove document permissions
   */
  async remove (id, params) {
    const target = params.target;
    assert(target, 'target document is not exists.');
    assert(params.query.ace, 'ace is not provided');

    const svcPermissions = this.app.service('user-permissions');
    return svcPermissions.remove(params.query.ace);
  }
}

export default function init (app, options, hooks) {
  return new DocumentPermissionService(options);
}

init.Service = DocumentPermissionService;
