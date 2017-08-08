import { omit } from 'lodash';
import Entity from 'mostly-entity';
import url from 'url';

const BlobEntity = new Entity('Blob');

BlobEntity.expose('url', (obj, options) => {
  switch(obj.vender) {
    case 'local':
      const baseUrl = options.blobs
        && options.blobs.local
        && options.blobs.local.baseUrl;
      return url.resolve(baseUrl, obj.key);
    default: return obj.url || obj.key;
  }
});

BlobEntity.excepts('destroyedAt');

export default BlobEntity.asImmutable();
