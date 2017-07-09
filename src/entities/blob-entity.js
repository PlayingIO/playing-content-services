import { omit } from 'lodash';
import Entity from 'mostly-entity';

const BlobEntity = new Entity('Blob');

BlobEntity.expose('url', obj => {
  return obj.url || obj.key;
});

BlobEntity.excepts('destroyedAt');

export default BlobEntity.asImmutable();
