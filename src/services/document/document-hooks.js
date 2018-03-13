import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import * as content from '~/hooks';

module.exports = function(options = {}) {
  const authOptions = Object.assign({}, options, {
    permissionField: 'permissions,groups.group.permissions,*'
  });
  return {
    before: {
      all: [
        hooks.authenticate('jwt', authOptions),
        hooks.authorize('document')
      ],
      get: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      find: [
        // queryWithCurrentUser({ idField: 'id', as: 'creator' })
      ],
      create: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        content.computePath(),
        content.computeAncestors(),
        content.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      update: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('id', 'metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath(),
        content.computeAncestors(),
        content.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      patch: [
        iff(isProvider('external'),
          associateCurrentUser({ idField: 'id', as: 'creator' })),
        hooks.depopulate('parent'),
        hooks.discardFields('id', 'metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        content.computePath(),
        content.computeAncestors(),
        content.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ]
    },
    after: {
      all: [
        iff(isProvider('external'), hooks.discardFields('ACL')),
        hooks.responder()
      ],
      find: [
        // only populate with document type to avoid duplicated process
        iff(content.isDocumentType('document'),
          hooks.populate('parent', { service: 'folders' })),
        iff(content.isDocumentType('document'),
          hooks.populate('ancestors')), // with typed id
        iff(content.isDocumentType('document'),
          hooks.populate('creator', { service: 'users' })),
        iff(content.isDocumentType('document'),
          hooks.assoc('permissions', { service: 'user-permissions', field: 'subject', typeField: 'type' })),
        iff(content.isDocumentType('document'),
          content.documentEnrichers(options)),
        iff(content.isDocumentType('document'),
          content.presentDocument(options)),
      ],
      get: [
        // only populate with document type to avoid duplicated process
        iff(content.isDocumentType('document'),
          hooks.populate('parent', { service: 'folders' })),
        iff(content.isDocumentType('document'),
          hooks.populate('ancestors')), // with typed id
        iff(content.isDocumentType('document'),
          hooks.populate('creator', { service: 'users' })),
        iff(content.isDocumentType('document'),
          hooks.assoc('permissions', { service: 'user-permissions', field: 'subject', typeField: 'type' })),
        iff(content.isDocumentType('document'),
          content.documentEnrichers(options)),
        iff(content.isDocumentType('document'),
          content.presentDocument(options)),
      ],
      create: [
        iff(content.isDocumentType('document'),
          hooks.publishEvent('document.create', { prefix: 'playing' }))
      ]
    }
  };
};