import { omit } from 'lodash';
import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';
import ResourceEntity from './resource-entity';

const FileEntity = new Entity('File', {
  file: { using: ResourceEntity },
  files: { using: ResourceEntity },
});

FileEntity.expose('parent', (obj, options) => {
  if (options.provider && obj.parent.parent) {
    return omit(obj.parent, ['parent']);
  }
  return obj.parent;
});

FileEntity.expose('metadata', {}, obj => {
  if (obj.metadata) return obj.metadata;

  const breadcrumbs = getBreadcrumbs(obj);
  const facets = [];
  const favorites = [];
  const subtypes = [];
  const permissions = ['Everything'];
  const thumbnail = {
    url: '/bower_components/playing-content-elements/images/icons/icon_100.png'
  };
  return Object.assign({}, { breadcrumbs, facets, favorites, permissions, subtypes, thumbnail });
});

FileEntity.excepts('destroyedAt');

export default FileEntity.asImmutable();
