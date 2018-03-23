import Entity from 'mostly-entity';

const AuthorEntity = new Entity('Author');

AuthorEntity.excepts('createdAt', 'updatedAt', 'destroyedAt');

export default AuthorEntity.asImmutable();
