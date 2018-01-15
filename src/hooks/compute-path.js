import makeDebug from 'debug';
import fp from 'mostly-func';
import slug from 'limax';
import path from 'path';
import shortid from 'shortid';

const debug = makeDebug('playing:content-services:hooks:computePath');

// compute current path by parent
export default function computePath(options = { slug: false }) {
  return (hook) => {
    const svcDocuments = hook.app.service('documents');

    // get parent or root
    let parentQuery = null;
    if (hook.data.parent) {
      parentQuery = svcDocuments.get(hook.data.parent);
    } else if (hook.method === 'create' && hook.data.path !== '/') {
      parentQuery = svcDocuments.action('first').find({ query: { path : '/' } });
    }

    if (parentQuery) {
      return parentQuery.then(parent => {
        if (parent && parent.path) {
          hook.data.parent = parent.id;
          // generate new type-name or use the existing name
          const type = hook.data.type || options.type || 'document';
          let name = type + '-' + shortid.generate();
          if (options.slug) {
            if (hook.data.title && hook.data.title.length > 0) {
              name = type + '-' + slug(hook.data.title, { tone: false });
            }
          } else if (hook.data.path) {
            name = path.basename(hook.data.path);
            // if name does not contain and start with doc type, add doc type to name
            if (name.indexOf('-') < 0 && !name.startsWith(type)) {
              name = type + '-' + name;
            }
          }
          debug('compute parent path', parent.path, name);
          // join the parent path (against parent changing)
          hook.data.path = path.join(parent.path, name);
        } else {
          debug('Parent path undefined', parent);
          throw new Error('Parent path undefined');
        }
        return hook;
      });
    }
  };
}
