import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';

const FolderEntity = new Entity('Folder', {
  parent: { omit: ['parent'] }
});

FolderEntity.expose('metadata', {}, obj => {
  const breadcrumbs = getBreadcrumbs(obj);
  const facets = ['Folderish'];
  const subtypes = ['folder', 'file', 'note'];
  return Object.assign(obj.metadata || {}, { breadcrumbs, facets, subtypes });
});

FolderEntity.excepts('destroyedAt');

export default FolderEntity.asImmutable();
