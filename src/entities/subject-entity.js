import Entity from 'mostly-entity';

const SubjectEntity = new Entity('Subject');

SubjectEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default SubjectEntity.asImmutable();
