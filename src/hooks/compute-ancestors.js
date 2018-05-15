import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import slug from 'limax';
import path from 'path';
import shortid from 'shortid';
import { getParentDocument, isRootFolder } from '../helpers';

const debug = makeDebug('playing:content-services:hooks:computeAncestors');

// compute ancestors of current document
export default function computeAncestors () {
  return (context) => {
    assert(context.type === 'before', `computeAncestors must be used as a 'before' hook.`);

    // skip update/patch if not changing parent with both parent and path
    if (context.method === 'update' || context.method === 'patch') {
      if (!(context.data.parent && context.data.path)) return context;
    }

    // get parent or root document
    return getParentDocument(context.app, context.id, context.data).then(parent => {
      if (parent && parent.ancestors) {
        // join the parent ancestors typed id (against parent changing)
        const typedId = (parent.type || 'document') + ':' + parent.id;
        context.data.ancestors = fp.concat(parent.ancestors, [typedId]);
      } else {
        if (!isRootFolder(context.data.path)) {
          debug('Parent ancestors undefined', parent);
          throw new Error('Parent ancestors undefined');
        }
      }
      return context;
    });
  };
}
