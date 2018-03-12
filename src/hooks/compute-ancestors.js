import assert from 'assert';
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
    assert(hook.type === 'before', `computeAncestors must be used as a 'before' hook.`);

    // skip update/patch if not changing parent with both parent and path
    if (hook.method === 'update' || hook.method === 'patch') {
      if (!(hook.data.parent && hook.data.path)) return hook;
    }

    // get parent or root document
    return getParentDocument(hook.app, hook.id, hook.data).then(parent => {
      if (parent && parent.ancestors) {
        // join the parent ancestors typed id (against parent changing)
        const typedId = (parent.type || 'document') + ':' + parent.id;
        hook.data.ancestors = fp.concat(parent.ancestors, [typedId]);
      } else {
        debug('Parent ancestors undefined', parent);
        throw new Error('Parent ancestors undefined');
      }
      return hook;
    });
  };
}
