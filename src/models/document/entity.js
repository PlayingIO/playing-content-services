import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';

const DocumentEntity = new Entity('Document', {
  parent: { omit: ['parent'] }
});

DocumentEntity.expose('metadata', {}, obj => {
  const breadcrumbs = getBreadcrumbs(obj);
  const facets = [];
  const subtypes = [];
  return Object.assign(obj.metadata || {}, { breadcrumbs, facets, subtypes });
});

DocumentEntity.excepts('destroyedAt');

export default DocumentEntity.asImmutable();
