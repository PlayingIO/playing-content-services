import assert from 'assert';
import toBuffer from 'concat-stream';
import { getBase64DataURI, parseDataURI } from 'dauria';
import makeDebug from 'debug';
import errors from 'feathers-errors';
import mimeTypes from 'mime-types';
import { Service, createService, transform } from 'mostly-feathers-mongoose';

import BlobModel from '~/models/blob-model';
import defaultHooks from './blob-hooks';
import { fromBuffer, bufferToHash } from './util';

const debug = makeDebug('playing:content-services:blob');

const defaultOptions = {
  name: 'blob-service',
  fileCDN: '/file/'
};

class BlobService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);

    if (!options.Storage) {
      throw new Error('BlobService `options.Storage` must be provided');
    }

    this.Storage = options.Storage;
    this.fileCDN = options.fileCDN;
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks({
      fileCDN: this.fileCDN
    }));
  }

  get(id, params) {
    let [batchId, index] = id.split('.');
    debug('get', batchId, index);

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

  _getBlob(batchId, index) {
    return super.get(batchId).then(result => {
      if (!result) throw new Error('Blob batch id not exists');
      const batch = result.data || result;
      const blobs = batch.blobs || [];
      if (index >= blobs.length) throw new Error('Blob index out of range of the batch');
      return blobs[index];
    }).then(transform);
  }

  create(data, params) {
    return super.create(data, params);
  }

  update(id, data, params) {
    debug('update', id, data, params);
    assert(params.file, 'params file not provided.');
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
      const index = data.index || batch.blobs.length;
      const vender = data.vender || 'file';
      const key = `${id}.${index}.${ext}`;
      return new Promise((resolve, reject) => {
        fromBuffer(buffer)
          .pipe(this.Storage.createWriteStream({
            key, name, vender, mimetype, size
          }, (error) => {
            if (error) return reject(error);
            let blob = {
              index, name, key, vender, mimetype, size
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
      return super.patch(id, { blobs: blobs }).then(batch =>
        batch.blobs? batch.blobs[batch.blobs.length - 1] : {}
      ).then(transform);
    };

    return getBatch(id)
      .then(writeBlob)
      .then(updateBlobs);
  }

  patch(id, data, params) {
    return super.update(id, data, params);
  }

  remove (id) {
    let [batchId, index] = id.split('.');
    debug('remove', batchId, index);

    const removeBlob = blob => {
      debug('remove blob', blob);
      return new Promise((resolve, reject) => {
        this.Storage.remove({
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

  attachOnDocument(id, data, params, original) {
    assert(data.context && data.context.currentDocument, 'context.currentDocument not provided.');
    assert(data.context && data.context.documentType, 'context.documentType not provided.');
    const documents = this.app.service('documents');
    if (documents) {
      let blobs = (original.blobs || []).map(blob => {
        blob.batch = original.id;
        delete blob.id;
        return blob;
      });
      debug('attach blobs', blobs);
      return documents.get(data.context.currentDocument).then(doc => {
        if (!doc) throw new Error('currentDocument not exists');
        let files = (doc.files || []).concat(blobs);
        debug('attach files', files);
        return documents.patch(doc.id, { files: files });
      });
    }
  }
}

export default function init(app, options) {
  options = Object.assign({ ModelName: 'blob' }, options);
  return createService(app, BlobService, BlobModel, options);
}

init.Service = BlobService;

