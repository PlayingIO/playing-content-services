import Entity from 'mostly-entity';

const ResourceEntity = new Entity('Resource', {
  _id: { as: 'id', type: 'string' }
});

ResourceEntity.excepts('_id', 'createdAt', 'updatedAt', 'destroyedAt');

export default ResourceEntity.asImmutable();
