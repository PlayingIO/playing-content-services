import assert from 'assert';
import concat from 'concat-stream';
import { getBase64DataURI, parseDataURI } from 'dauria';
import makeDebug from 'debug';
import errors from 'feathers-errors';
import mimeTypes from 'mime-types';
import { Service, createService, transform } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';
import request from 'request';
import stream from 'stream';

import BlobModel from '~/models/blob-model';
import defaultHooks from './blob-hooks';
import { fromBuffer, bufferToHash } from './util';

const debug = makeDebug('playing:content-services:blobs');

const defaultOptions = {
  name: 'blobs',
};

class BlobService extends Service {
  constructor (options) {
    options = Object.assign({}, defaultOptions, options);
    assert(options.blobs, 'BlobService blobs option required');

    super(options);
  }

  setup (app) {
    super.setup(app);
    this.storage = app.get('storage');
    if (!this.storage) {
      throw new Error('app context `storage` must be provided');
    }
    this.hooks(defaultHooks(this.options));
  }

  get (id, params) {
    let [batchId, index] = id.split('.');
    debug('get', batchId, index);

    const readBlob = (blob) => {
      debug('readBlob', blob);
      return this._readBlob(blob).then(buffer => {
        blob.file = getBase64DataURI(buffer, blob.mimetype);
      });
    };

    if (index !== undefined) {
      return this._getBlob(batchId, index).then(blob =>
        params.query.embedded !== undefined? readBlob(blob) : blob);
    } else {
      return super.get(id, params).then(result => {
        debug('getBatch', result);
        result.blobs = transform(result.blobs);
        return result;
      });
    }
  }

  _readBlob (blob, bucket) {
    return new Promise((resolve, reject) => {
      this.storage.createReadStream(blob)
      .on('error', reject)
      .pipe(concat(buffer => {
        resolve(buffer);
      }));
    });
  }

  _getBlob (batchId, index) {
    return super.get(batchId).then(result => {
      if (!result) throw new Error('Blob batch id not exists');
      const batch = result.data || result;
      const blobs = batch.blobs || [];
      if (index >= blobs.length) throw new Error('Blob index out of range of the batch');
      return blobs[index];
    }).then(transform);
  }

  create (data, params) {
    return super.create(data, params);
  }

  update (id, data, params) {
    debug('update', id, data, params);
    assert(params.file, 'params file not provided.');

    const name = params.file.originalname;
    const mimetype = params.file.mimetype;
    const ext = mimeTypes.extension(mimetype);
    const size = params.file.size;

    const getBuffer = (file) => {
      if (file.url) {
        const req = request.defaults({ encoding: null });
        return new Promise((resolve, reject) => {
          req.get(file.url, function (err, res, buffer) {
            if (err) return reject(err);
            return resolve(buffer);
          });
        });
      }
      if (file.key) {
        return this._readBlob(file);
      }
      debug('getBuffer not supports this file', file);
      throw new Error('getBuffer not supported on this file');
    };

    const getBatch = (id) => {
      return super.get(id).then(result => {
        if (!result) throw new Error('Blob batch id not exists');
        return result.data || result;
      });
    };

    const writeBlob = ([batch, buffer]) => {
      batch.blobs = batch.blobs || [];
      const bucket = data.bucket || this.storage.bucket;
      const index = parseInt(data.index) || batch.blobs.length;
      const vender = data.vender || this.storage.name;
      const key = `${id}.${index}.${ext}`;
      return new Promise((resolve, reject) => {
        fromBuffer(buffer)
          .pipe(this.storage.createWriteStream({
            bucket, key, name, vender, mimetype, size
          }, (error) => {
            if (error) return reject(error);
            let blob = {
              bucket, key, index, name, vender, mimetype, size
            };
            if (index < batch.blobs.length) {
              batch.blobs[index] = blob;
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
        return batch.blobs && batch.blobs[batch.blobs.length - 1];
      });
    };

    return Promise.all([
      getBatch(id),
      getBuffer(params.file)
    ])
    .then(writeBlob)
    .then(updateBlobs);
  }

  patch (id, data, params) {
    return super.update(id, data, params);
  }

  remove (id) {
    let [batchId, index] = id.split('.');
    debug('remove', batchId, index);

    const removeBlob = (blob) => {
      debug('remove blob', blob);
      return new Promise((resolve, reject) => {
        this.storage.remove({
          key: blob.key
        }, error => error ? reject(error) : resolve(blob));
      });
    };

    if (index !== undefined) {
      return this._getBlob(batchId, index).then(removeBlob);
    } else {
      return super.remove(batchId);
    }
  }

  _attachOnDocument (id, data, params, original) {
    assert(data.context && data.context.currentDocument, 'context.currentDocument not provided.');
    assert(data.context && data.context.documentType, 'context.documentType not provided.');

    const svcDocuments = this.app.service('documents');

    let blobs = (original.blobs || []).map((blob) => {
      blob.batch = original.id;
      return fp.dissoc('id', blob);
    });

    return svcDocuments.get(data.context.currentDocument).then((doc) => {
      if (!doc) throw new Error('currentDocument not exists');
      let files = (doc.files || []).concat(blobs);
      debug('attachOnDocument', files);
      return svcDocuments.patch(doc.id, { files: files });
    });
  }

  _removeFromDocument (id, data, params, orignal) {
    assert(data.context && data.context.currentDocument, 'context.currentDocument not provided.');
    assert(data.context && data.context.documentType, 'context.documentType not provided.');
    assert(data.xpath, 'data.xpath not provided.');

    const svcDocuments = this.app.service('documents');

    return svcDocuments.get(data.context.currentDocument).then((doc) => {
      if (!doc) throw new Error('currentDocument not exists');
      if (data.xpath.startsWith('files')) {
        let [xpath, index] = data.xpath.split('/');
        let files = fp.remove(parseInt(index), 1, doc.files || []);
        debug('removeFromDocument', xpath, index, files);
        return svcDocuments.patch(doc.id, { files: files });
      } else {
        let xpath = data.xpath;
        debug('removeFromDocument', xpath);
        return svcDocuments.patch(doc.id, { [xpath]: null });
      }
    });
  }
}

export default function init (app, options) {
  options = Object.assign({ ModelName: 'blob' }, options);
  return createService(app, BlobService, BlobModel, options);
}

init.Service = BlobService;

