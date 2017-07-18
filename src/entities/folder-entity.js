import { omit, pick } from 'lodash';
import Entity from 'mostly-entity';
import { DocTypes } from '~/constants';
import BlobEntity from './blob-entity';

const FolderEntity = new Entity('Folder', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

FolderEntity.expose('parent', (obj, options) => {
  if (options.provider && obj.parent && obj.parent.parent) {
    return omit(obj.parent, ['parent']);
  }
  return obj.parent;
});

FolderEntity.expose('metadata', (obj, options) => {
  obj.metadata = obj.metadata || {};
  
  const Types = options.DocTypes || DocTypes;

  obj.metadata.facets = Types[obj.type].facets;
  obj.metadata.packages = Types[obj.type].packages;

  return obj.metadata;
});

FolderEntity.excepts('destroyedAt');

export default FolderEntity.asImmutable();
