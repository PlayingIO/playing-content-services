import makeDebug from 'debug';
import fp from 'mostly-func';
import slug from 'limax';
import path from 'path';
import shortid from 'shortid';
import { getParentDocument } from '../helpers';

const debug = makeDebug('playing:content-services:hooks:computeAncestors');

// compute ancestors of current document
export default function computeAncestors() {
  return (hook) => {
    const svcDocuments = hook.app.service('documents');

    // get parent or root document
    return getParentDocument(hook.data.path, hook.data.parent).then(parent => {
      if (parent && parent.ancestors) {
        // join the parent ancestors typed id (against parent changing)
        const typedId = (parent.type || 'document') + ':' + parent.id;
        hook.data.ancestors = fp.concat(parent.ancestors, typedId);
      } else {
        debug('Parent ancestors undefined', parent);
        throw new Error('Parent ancestors undefined');
      }
      return hook;
    });
  };
}
