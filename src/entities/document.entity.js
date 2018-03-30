import Entity from 'mostly-entity';
import fp from 'mostly-func';

import { DocTypes } from '../constants';
import BlobEntity from './blob.entity';

const DocumentEntity = new Entity('Document', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

DocumentEntity.expose('metadata', (obj, options) => {
  obj.metadata = obj.metadata || {};
  
  const Types = options.DocTypes || DocTypes;

  if (Types[obj.type]) {
    obj.metadata.facets = Types[obj.type].facets;
    obj.metadata.packages = Types[obj.type].packages;
  }

  return fp.sortKeys(obj.metadata);
});

DocumentEntity.excepts('destroyedAt');

export default DocumentEntity.asImmutable();
