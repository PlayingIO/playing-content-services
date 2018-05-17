import assert from 'assert';
import fp from 'mostly-func';
import makeDebug from 'debug';

import { DocTypes, Permissions } from '../constants';

const debug = makeDebug('playing:content-services:hooks:fetchBlobs');

// check whether there is any folder children
export default function fetchBlobs (options = {}) {
  assert(options.xpath || options.xpaths, 'fetchBlobs need specified xpath(s)');

  return async context => {
    assert(context.type === 'before', `fetchBlob must be used as a 'before' hook.`);

    // If it was an internal call then skip this hook
    if (!context.params.provider) {
      return context;
    }
 
    const svcBlobs = context.app.service('blobs');

    function getFullBlob (file) {
      // fetch only file is not fulfilled
      if (file && file.batch && !fp.isNil(file.index) && !(file.key || file.url)) {
        return svcBlobs.get(file.batch).then(batch => {
          let blob = batch.blobs.find(b => b.index === parseInt(file.index));
          return Object.assign(file, blob);
        });
      }
      return Promise.resolve(file);
    }

    let promises = [];

    if (options.xpath) {
      const file = fp.dotPath(options.xpath, context.data);
      if (file) {
        const getFileBlob = getFullBlob(file).then(blob => {
          debug('getFullBlob', options.xpath, blob);
          context.data = fp.assocDotPath(options.xpath, blob, context.data);
        });
        promises.push(getFileBlob);
      }
    }

    if (options.xpaths) {
      const files = fp.dotPath(options.xpaths, context.data);
      if (files && Array.isArray(files)) {
        const getFilesBlob = Promise.all(files.map(file => getFullBlob(file)))
          .then(blobs => {
            debug('getFullBlob', options.xpaths, blobs);
            context.data = fp.assocDotPath(options.xpaths, blobs, context.data);
          });
        promises.push(getFilesBlob);
      }
    }

    const results = await Promise.all(promises);
    debug('fetchBlob hook.data', context.data, results);
    return context;
  };
}