import { omit, pick } from 'lodash';
import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';
import { DocTypes, Permissions } from '~/constants';
import ResourceEntity from './resource-entity';

const FolderEntity = new Entity('Folder', {
  file: { using: ResourceEntity },
  files: { using: ResourceEntity },
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
  const facets = [];
  const favorites = [];
  const subtypes = Object.values(pick(DocTypes, ['File', 'Folder', 'Picture']));
  const permissions = ['Everything', 'Read', 'Write', 'ReadWrite', 'ReadChildren', 'AddChildren', 'RemoveChildren'];
  const thumbnail = {
    url: 'bower_components/playing-content-elements/images/icons/icon_100.png'
  };
  return Object.assign({}, { breadcrumbs, facets, favorites, permissions, subtypes, thumbnail });
});

FolderEntity.excepts('destroyedAt');

export default FolderEntity.asImmutable();
