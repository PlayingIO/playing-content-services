import { omit, pick } from 'lodash';
import Entity from 'mostly-entity';
import { getBreadcrumbs } from '~/helpers';
import { DocTypes, Permissions } from '~/constants';
import BlobEntity from './blob-entity';

const DocumentEntity = new Entity('Document', {
  file: { using: BlobEntity },
  files: { using: BlobEntity },
});

DocumentEntity.expose('parent', (obj, options) => {
  if (options.provider && obj.parent && obj.parent.parent) {
    return omit(obj.parent, ['parent']);
  }
  return obj.parent;
});

DocumentEntity.expose('metadata', obj => {
  if (obj.metadata) return obj.metadata;

  const breadcrumbs = getBreadcrumbs(obj);
  const facets = [];
  const favorites = [];
  const subtypes = Object.values(pick(DocTypes, ['Picture']));
  const permissions = ['Everything', 'Read', 'Write', 'ReadWrite'];
  const thumbnail = {
    url: 'bower_components/playing-content-elements/images/icons/icon_100.png'
  };
  return Object.assign({}, { breadcrumbs, facets, favorites, permissions, subtypes, thumbnail });
});

DocumentEntity.excepts('destroyedAt');

export default DocumentEntity.asImmutable();
