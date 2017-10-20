import assert from 'assert';
import fp from 'mostly-func';
import makeDebug from 'debug';

import { DocTypes, Permissions } from '~/constants';

const debug = makeDebug('playing:content-services:hooks:fetchBlobs');

// check whether there is any folder children
export default function fetchBlobs(options) {
  return (hook) => {
    assert(hook.type === 'before', `fetchBlob must be used as a 'before' hook.`);

    // If it was an internal call then skip this hook
    if (!hook.params.provider) {
      return hook;
    }
 
    const svcBlobs = hook.app.service('blobs');

    function getFullBlob(file) {
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

    if (hook.data.file) {
      const getFileBlob = getFullBlob(hook.data.file).then(blob => {
        debug('getFullBlob file', blob);
        hook.data.file = blob;
      });
      promises.push(getFileBlob);
    }
    
    if (hook.data.files) {
      const getFilesBlob = Promise.all(hook.data.files.map(file => getFullBlob(file)))
        .then(blobs => {
          debug('getFullBlob files', blobs);
          hook.data.files = blobs;
        });
    }

    return Promise.all(promises).then(results => {
      debug('fetchBlob hook.data', hook.data, results);
      return hook;
    });
  };
}