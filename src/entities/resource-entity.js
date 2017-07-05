import { omit } from 'lodash';
import Entity from 'mostly-entity';

const ResourceEntity = new Entity('Resource', {
  mimeType: { type: 'string', default: 'image/png' }
});

ResourceEntity.expose('url', obj => {
  // TODO qiniu
  return obj.url;
});

ResourceEntity.excepts('destroyedAt');

export default ResourceEntity.asImmutable();
