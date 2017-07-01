import Entity from 'mostly-entity';

const TagEntity = new Entity('Tag');

TagEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default TagEntity.asImmutable();
