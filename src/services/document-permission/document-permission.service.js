const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');
const { plural } = require('pluralize');
const { getParentAces } = require('playing-content-common');

const defaultHooks = require('./document-permission.hooks');

const debug = makeDebug('playing:content-services:documents/permissions');

const defaultOptions = {
  name: 'documents/permissions'
};

class DocumentPermissionService {
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
    const target = params.primary;
    assert(target && target.id, 'target document is not exists.');
    assert(data.actions, 'actions is not provided.');
    assert(data.user, 'user is not provided.');

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

    const target = params.primary;
    assert(target && target.id, 'target document is not exists.');
    assert(data.ace, 'id is not provided.');
    assert(data.actions, 'action is not provided.');
    assert(data.user, 'user is not provided.');

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
    const target = params.primary;
    assert(target && target.id, 'target document is not exists.');
    assert(params.query.ace, 'ace is not provided');

    const svcPermissions = this.app.service('user-permissions');
    return svcPermissions.remove(params.query.ace);
  }

  /**
   * Block document permission inheritance
   */
  async blockInheritance (id, data, params) {
    const target = params.primary;
    assert(target && target.id, 'target document is not exists.');

    // copy inherited permissions
    const svcDocuments = this.app.service(plural(target.type));
    const svcPermissions = this.app.service('user-permissions');
    const inheritedAces = await getParentAces(this.app, [target], '*');
    if (inheritedAces && inheritedAces[target.id]) {
      await Promise.all(fp.map(ace => {
        ace.subject = `${target.type}:${target.id}`;
        ace.creator = params.user.id;
        return svcPermissions.create(ace);
      }, inheritedAces[target.id]));
    }
    return svcDocuments.patch(target.id, { inherited: false }, params);
  }

  /**
   * Unblock document permission inheritance
   */
  async unblockInheritance (id, data, params) {
    const target = params.primary;
    assert(target && target.id, 'target document is not exists.');

    // remove copied permissions
    const svcDocuments = this.app.service(plural(target.type));
    const svcPermissions = this.app.service('user-permissions');
    const inheritedAces = await getParentAces(this.app, [target], '*');
    if (inheritedAces && inheritedAces[target.id]) {
      await Promise.all(fp.map(ace => {
        return svcPermissions.remove(null, {
          query: {
            actions: ace.actions,
            subject: `${target.type}:${target.id}`,
            user: ace.user,
            role: ace.role,
            creator: params.user.id
          },
          $multi: true
        });
      }, inheritedAces[target.id]));
    }
    return svcDocuments.patch(target.id, { inherited: true }, params);
  }
}

module.exports = function init (app, options, hooks) {
  return new DocumentPermissionService(options);
};
module.exports.Service = DocumentPermissionService;
