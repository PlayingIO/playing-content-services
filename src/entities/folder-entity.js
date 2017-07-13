import { omit, pick } from 'lodash';
import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';
import { DocTypes, Permissions } from '~/constants';
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

FolderEntity.expose('metadata', {}, obj => {
  if (obj.metadata) return obj.metadata;
  
  const breadcrumbs = getBreadcrumbs(obj);
  const facets = DocTypes[obj.type].facets;
  const favorites = [];
  const packages = DocTypes[obj.type].packages;
  const permissions = ['Everything', 'Read', 'Write', 'ReadWrite', 'ReadChildren', 'AddChildren', 'RemoveChildren'];
  const subtypes = Object.values(pick(DocTypes, ['collection', 'file', 'folder', 'picture']));
  const thumbnail = {
    url: 'bower_components/playing-content-elements/images/icons/folder.png'
  };
  return Object.assign({}, { breadcrumbs, facets, favorites, packages, permissions, subtypes, thumbnail });
});

FolderEntity.excepts('destroyedAt');

export default FolderEntity.asImmutable();
