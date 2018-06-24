import { iff, isProvider } from 'feathers-hooks-common';
import { associateCurrentUser, queryWithCurrentUser } from 'feathers-authentication-hooks';
import { hooks } from 'mostly-feathers-mongoose';
import { cache } from 'mostly-feathers-cache';
import { authorize } from 'playing-permissions';
import contents from 'playing-content-common';

import { presentDocument } from '../../hooks';

export default function (options = {}) {
  return {
    before: {
      all: [
        hooks.authenticate('jwt', options.auth),
        authorize('document', { // check permissions on document with ancestors
          ancestors: { field: 'ancestors', service: 'documents' }
        }),
        cache(options.cache, { headers: ['enrichers-document'] })
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
        contents.computePath(),
        contents.computeAncestors(),
        contents.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      update: [
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        contents.computePath(),
        contents.computeAncestors(),
        contents.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ],
      patch: [
        iff(hooks.isAction('move', 'restore'),
          hooks.addRouteObject('primary', { service: 'documents', field: 'id' })),
        hooks.depopulate('parent'),
        hooks.discardFields('metadata', 'ancestors', 'createdAt', 'updatedAt', 'destroyedAt'),
        contents.computePath(),
        contents.computeAncestors(),
        contents.fetchBlobs({ xpath: 'file', xpaths: 'files' })
      ]
    },
    after: {
      all: [
        // only populate with document type to avoid duplicated process
        iff(contents.isDocumentType('document'),
          hooks.populate('parent', { service: 'folders' })),
        iff(contents.isDocumentType('document'),
          hooks.populate('ancestors')), // with typed id
        iff(contents.isDocumentType('document'),
          hooks.populate('creator', { service: 'users' })),
        iff(contents.isDocumentType('document'),
          hooks.assoc('permissions', { service: 'user-permissions', field: 'subject', typeField: 'type' })),
        iff(contents.isDocumentType('document'),
          contents.documentEnrichers(options)),
        cache(options.cache, { headers: ['enrichers-document'] }),
        iff(contents.isDocumentType('document'),
          presentDocument(options)),
        hooks.responder()
      ],
      create: [
        iff(contents.isDocumentType('document'),
          contents.documentNotifier('document.create'))
      ]
    }
  };
}