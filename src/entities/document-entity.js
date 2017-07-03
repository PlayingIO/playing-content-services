import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';

const DocumentEntity = new Entity('Document', {
  parent: { omit: ['parent'] }
});

DocumentEntity.expose('metadata', {}, obj => {
  const breadcrumbs = getBreadcrumbs(obj);
  const facets = [];
  const favorites = [];
  const subtypes = [];
  const thumbnail = '/bower_components/playing-content-elements/images/icons/icon_100.png';
  return Object.assign(obj.metadata || {}, { breadcrumbs, facets, favorites, subtypes });
});

DocumentEntity.excepts('destroyedAt');

export default DocumentEntity.asImmutable();
