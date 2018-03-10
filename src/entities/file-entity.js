import Entity from 'mostly-entity';
import fp from 'mostly-func';
import { DocTypes } from '~/constants';
import BlobEntity from './blob-entity';

const FileEntity = new Entity('File', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

FileEntity.expose('metadata', (obj, options) => {
  obj.metadata = obj.metadata || {};
  
  const Types = options.DocTypes || DocTypes;

  if (Types[obj.type]) {
    obj.metadata.facets = Types[obj.type].facets;
    obj.metadata.packages = Types[obj.type].packages;
  }

  return fp.sortKeys(obj.metadata);
});

FileEntity.excepts('destroyedAt');

export default FileEntity.asImmutable();
