import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import path from 'path';
import { getParentDocument, isRootFolder, shortname } from '../helpers';

const debug = makeDebug('playing:content-services:hooks:computePath');

// compute current path by parent
export default function computePath (options = { slug: false }) {
  return async (context) => {
    assert(context.type === 'before', `computePath must be used as a 'before' hook.`);

    // skip update/patch if not changing parent with both parent and path
    if (context.method === 'update' || context.method === 'patch') {
      if (!(context.data.parent && context.data.path)) return context;
    }

    // get new parent or root document (if creating)
    const parent = await getParentDocument(context.app, null, context.data);
    if (parent && parent.path) {
      context.data.parent = parent.id;
      // generate new type-name or use the existing name
      const type = context.data.type || options.type || 'document';
      const name = shortname(type, context.data.path, options.slug && context.data.title);
      debug('compute parent path', parent.path, name);
      // join the parent path (against parent changing)
      context.data.path = path.join(parent.path, name);
    } else {
      if (!isRootFolder(context.data.path)) {
        debug('Parent path undefined', parent);
        throw new Error('Parent path undefined');
      }
    }
    return context;
  };
}
