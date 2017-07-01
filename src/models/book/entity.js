import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';

const BookEntity = new Entity('Book', {
  parent: { omit: ['parent'] }
});

BookEntity.expose('metadata', {}, obj => {
  const breadcrumbs = getBreadcrumbs(obj);
  const facets = ['Downloadable', 'Commentable'];
  const subtypes = ['chapter'];
  return Object.assign(obj.metadata || {}, { breadcrumbs, facets, subtypes });
});

BookEntity.excepts('destroyedAt');

export default BookEntity.asImmutable();
