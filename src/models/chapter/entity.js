import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';

const ChapterEntity = new Entity('Chapter', {
  parent: { omit: ['parent'] }
});

ChapterEntity.expose('metadata', {}, obj => {
  const breadcrumbs = getBreadcrumbs(obj);
  const facets = [];
  const subtypes = [];
  return Object.assign(obj.metadata || {}, { breadcrumbs, facets, subtypes });
});

ChapterEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default ChapterEntity.asImmutable();
