import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';

const FileEntity = new Entity('File', {
  parent: { omit: ['parent'] }
});

FileEntity.expose('metadata', {}, obj => {
  const breadcrumbs = getBreadcrumbs(obj);
  const facets = [];
  const favorites = [];
  const subtypes = [];
  const thumbnail = {
    url: '/bower_components/playing-content-elements/images/icons/icon_100.png'
  };
  return Object.assign(obj.metadata || {}, { breadcrumbs, facets, favorites, subtypes, thumbnail });
});

FileEntity.excepts('destroyedAt');

export default FileEntity.asImmutable();
