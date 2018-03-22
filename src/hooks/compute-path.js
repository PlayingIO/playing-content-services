import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import path from 'path';
import { getParentDocument, shortname } from '../helpers';

const debug = makeDebug('playing:content-services:hooks:computePath');

// compute current path by parent
export default function computePath (options = { slug: false }) {
  return (hook) => {
    assert(hook.type === 'before', `computePath must be used as a 'before' hook.`);

    // skip update/patch if not changing parent with both parent and path
    if (hook.method === 'update' || hook.method === 'patch') {
      if (!(hook.data.parent && hook.data.path)) return hook;
    }

    // get new parent or root document (if creating)
    return getParentDocument(hook.app, null, hook.data).then(parent => {
      if (parent && parent.path) {
        hook.data.parent = parent.id;
        // generate new type-name or use the existing name
        const type = hook.data.type || options.type || 'document';
        const name = shortname(type, hook.data.path, options.slug && hook.data.title);
        debug('compute parent path', parent.path, name);
        // join the parent path (against parent changing)
        hook.data.path = path.join(parent.path, name);
      } else {
        debug('Parent path undefined', parent);
        throw new Error('Parent path undefined');
      }
      return hook;
    });
  };
}
