import { omit, pick } from 'lodash';
import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';
import { DocTypes } from '~/constants';
import BlobEntity from './blob-entity';

const FileEntity = new Entity('File', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

FileEntity.expose('parent', (obj, options) => {
  if (options.provider && obj.parent && obj.parent.parent) {
    return omit(obj.parent, ['parent']);
  }
  return obj.parent;
});

FileEntity.expose('metadata', (obj, options) => {
  obj.metadata = obj.metadata || {};
  
  const Types = options.DocTypes || DocTypes;

  obj.metadata.facets = Types[obj.type].facets;
  obj.metadata.packages = Types[obj.type].packages;

  return obj.metadata;
});

FileEntity.excepts('destroyedAt');

export default FileEntity.asImmutable();
