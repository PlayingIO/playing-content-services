import { omit } from 'lodash';
import Entity from 'mostly-entity';
import url from 'url';

const BlobEntity = new Entity('Blob');

BlobEntity.expose('url', (obj, options) => {
  const fileCDN = options.blobs && options.blobs.fileCDN;
  switch(obj.vender) {
    case 'file': return url.resolve(fileCDN, obj.key);
    default: return obj.url || obj.key;
  }
});

BlobEntity.excepts('destroyedAt');

export default BlobEntity.asImmutable();
