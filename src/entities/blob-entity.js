import { omit } from 'lodash';
import Entity from 'mostly-entity';
import url from 'url';

const BlobEntity = new Entity('Blob');

BlobEntity.expose('url', (obj, options) => {
  if (!obj.url) {
    switch(obj.vender) {
      case 'file':
        obj.url = url.resolve(options.fileCDN, obj.key);
        break;
      default: obj.url = obj.key;
    }
  }
  return obj.url;
});

BlobEntity.excepts('destroyedAt');

export default BlobEntity.asImmutable();
