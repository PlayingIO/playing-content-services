import makeDebug from 'debug';
import fp from 'mostly-func';
import path from 'path';
import { getParentDocument, shortname } from '../helpers';

const debug = makeDebug('playing:content-services:hooks:computePath');

// compute current path by parent
export default function computePath(options = { slug: false }) {
  return (hook) => {
    const svcDocuments = hook.app.service('documents');

    // get parent or root document
    return getParentDocument(hook.data.path, hook.data.parent).then(parent => {
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
