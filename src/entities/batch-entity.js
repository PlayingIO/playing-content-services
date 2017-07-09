import { omit } from 'lodash';
import Entity from 'mostly-entity';
import BlobEntity from './blob-entity';

const BatchEntity = new Entity('Batch', {
  blobs: { using: BlobEntity }
});

BatchEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default BatchEntity.asImmutable();
