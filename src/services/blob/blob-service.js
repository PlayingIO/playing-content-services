import toBuffer from 'concat-stream';
import { getBase64DataURI, parseDataURI } from 'dauria';
import errors from 'feathers-errors';
import mimeTypes from 'mime-types';
import { extname } from 'path';
import shortid from 'shortid';

import assert from 'assert';
import makeDebug from 'debug';
import { Service, createService } from 'mostly-feathers-mongoose';

import BlobModel from '~/models/blob-model';
import defaultHooks from './blob-hooks';
import { fromBuffer, bufferToHash } from './util';

const debug = makeDebug('playing:content-services:blob');

const defaultOptions = {
  name: 'blob-service'
};

class BlobService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);

    if (!options.Storage) {
      throw new Error('BlobService `options.Storage` must be provided');
    }

    this.Storage = options.Storage;
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks);
  }

  get(id) {
    let [batchId, idx] = id.split('.');
    debug('get', batchId, idx);

    const getBlob = (batchId, idx) => {
      return super.get(batchId).then(result => {
        if (!result) throw new Error('Blob batch id not exists');
        const batch = result.data || result;
        const blobs = batch.blobs || [];
        if (idx >= blobs.length) throw new Error('Blob index out of range of the batch');
        return blobs[idx];
      });
    };

    const readBlob = (blob) => {
      debug('readBlob', blob);
      return new Promise((resolve, reject) => {
        this.Storage.createReadStream({
          key: blob.key
        })
        .on('error', reject)
        .pipe(toBuffer(buffer => {
          blob.file = getBase64DataURI(buffer, blob.mimetype);
          resolve(blob);
        }));
      });
    };

    if (idx !== undefined) {
      return getBlob(batchId, idx).then(readBlob);
    } else {
      return super.get(batchId);
    }
  }

  create(data, params) {
    return super.create(data, params);
  }

  update(id, data, params) {
    debug('update', id, data, params);
    assert(params.file, 'params file not uploaded.');
    assert(params.file.buffer && params.file.buffer.type === 'Buffer', 'params file has no buffer.');

    const name = params.file.originalName;
    const mimetype = params.file.mimetype;
    const ext = mimeTypes.extension(mimetype);
    const buffer = Buffer.from(params.file.buffer.data);
    const size = params.file.size;

    const getBatch = (id) => {
      return super.get(id).then(result => {
        if (!result) throw new Error('Blob batch id not exists');
        return result.data || result;
      });
    };

    const writeBlob = (batch) => {
      batch.blobs = batch.blobs || [];
      const idx = data.fileIdx || batch.blobs.length;
      const key = `${id}.${idx}.${ext}`;
      return new Promise((resolve, reject) => {
        fromBuffer(buffer)
          .pipe(this.Storage.createWriteStream({
            key, name, mimetype, size
          }, (error) => {
            if (error) return reject(error);
            let blob = {
              idx, name, key, mimetype, size
            };
            if (idx < batch.blobs.length) {
              batch.blobs[idx] = blob;
            } else {
              batch.blobs.push(blob);
            }
            return resolve(batch.blobs);
          }))
          .on('error', reject);
      });
    };

    const updateBlobs = (blobs) => {
      return super.patch(id, { blobs: blobs }).then(batch => {
        let blob = batch.blobs[batch.blobs.length - 1];
        blob.file = getBase64DataURI(buffer, mimetype);
        delete blob._id;
        return blob;
      });
    };

    return getBatch(id)
      .then(writeBlob)
      .then(updateBlobs);
  }

  patch(id, data, params) {
    // same as update
    return this.update(id, data, params);
  }

  remove (id) {
    let [batchId, idx] = id.split('.');
    debug('remove', batchId, idx);
    
    const getBlob = (batchId, idx) => {
      return super.get(batchId).then(result => {
        if (!result) throw new Error('Blob batch id not exists');
        const batch = result.data || result;
        const blobs = batch.blobs || [];
        if (idx >= blobs.length) throw new Error('Blob index out of range of the batch');
        return blobs[idx];
      });
    };

    const removeBlob = blob => {
      debug('remove blob', blob);
      return new Promise((resolve, reject) => {
        this.Storage.remove({
          key: blob.key
        }, error => error ? reject(error) : resolve(blob));
      });
    };

    if (idx !== undefined) {
      return getBlob(batchId, idx).then(removeBlob);
    } else {
      return super.remove(batchId);
    }
  }
}

export default function init(app, options) {
  options = Object.assign({ ModelName: 'blob' }, options);
  return createService(app, BlobService, BlobModel, options);
}

init.Service = BlobService;

/*
class Service {
  constructor (options) {
    if (!options) {
      throw new Error('playing-blob-store: constructor `options` must be provided');
    }

    if (!options.Model) {
      throw new Error('playing-blob-store: constructor `options.Model` must be provided');
    }

    this.Model = options.Model;
    this.id = options.id || 'id';
  }

  setup(app) {
    this.hooks(defaultHooks);
  }

  extend (obj) {
    return Proto.extend(obj, this);
  }

  get(id) {
    const ext = extname(id);
    const contentType = mimeTypes.lookup(ext);

    return new Promise((resolve, reject) => {
      this.Model.createReadStream({
        key: id
      })
      .on('error', reject)
      .pipe(toBuffer(buffer => {
        const uri = getBase64DataURI(buffer, contentType);

        resolve({
          [this.id]: id,
          uri,
          size: buffer.length
        });
      }));
    });
  }

  create (body, params = {}) {
    debug('create', body, params);
    return Promise.resolve({
      batchId: shortid.generate()
    });
    // TODO
    // let { id, uri } = body;
    // const { buffer, MIME: contentType } = parseDataURI(uri);
    // const hash = bufferToHash(buffer);
    // const ext = mimeTypes.extension(contentType);

    // id = id || `${hash}.${ext}`;
  }

  update(id, body, params = {}) {
    debug('put', id, body, params);
    return Promise.resolve({
      file: 'http://www.url.com',
      mimeType: 'images/png'
    });
    // TODO
    // let { id, uri } = body;
    // const { buffer, MIME: contentType } = parseDataURI(uri);
    // const hash = bufferToHash(buffer);
    // const ext = mimeTypes.extension(contentType);

    // id = id || `${hash}.${ext}`;

    // return new Promise((resolve, reject) => {
    //   fromBuffer(buffer)
    //     .pipe(this.Model.createWriteStream({
    //       key: id,
    //       params: params.s3
    //     }, (error) =>
    //       error
    //         ? reject(error)
    //         : resolve({
    //           [this.id]: id,
    //           uri,
    //           size: buffer.length
    //         })
    //     ))
    //     .on('error', reject);
    // });
  }

  remove (id) {
    return new Promise((resolve, reject) => {
      this.Model.remove({
        key: id
      }, error => error ? reject(error) : resolve());
    });
  }
}

export default function init (app, options) {
  return new Service(options);
}

init.Service = Service;
*/
