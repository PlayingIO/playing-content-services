import makeDebug from 'debug';
import toBuffer from 'concat-stream';
import { getBase64DataURI, parseDataURI } from 'dauria';
import errors from 'feathers-errors';
import mimeTypes from 'mime-types';
import { extname } from 'path';
import shortid from 'shortid';
import Proto from 'uberproto';

import defaultHooks from './blob-hooks';
import { fromBuffer, bufferToHash } from './util';

const debug = makeDebug('playing:content-services:blob');

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
