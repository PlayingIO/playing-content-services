import { omit, pick } from 'lodash';
import Entity from 'mostly-entity';
import { DocTypes } from '~/constants';
import BlobEntity from './blob-entity';

const FolderEntity = new Entity('Folder', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

FolderEntity.expose('metadata', (obj, options) => {
  obj.metadata = obj.metadata || {};
  
  const Types = options.DocTypes || DocTypes;

  if (Types[obj.type]) {
    obj.metadata.facets = Types[obj.type].facets;
    obj.metadata.packages = Types[obj.type].packages;
  }

  return obj.metadata;
});

FolderEntity.excepts('destroyedAt');

export default FolderEntity.asImmutable();
