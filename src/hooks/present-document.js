import makeDebug from 'debug';
import fp from 'mostly-func';

import DocumentEntity from '~/entities/document.entity';
import FolderEntity from '~/entities/folder.entity';
import FileEntity from '~/entities/file.entity';
import NoteEntity from '~/entities/note.entity';

const debug = makeDebug('playing:content-services:hooks:presentDocument');

const defaultEntities = {
  document: DocumentEntity,
  folder: FolderEntity,
  file: FileEntity,
  note: NoteEntity
};

// presentEntity by document type
export default function presentDocument (options = {}) {
  const entities = Object.assign(defaultEntities, options.entities);

  return (hook) => {
    const presentEntity = function (doc) {
      options.provider = hook.params.provider;

      if (doc.type && entities[doc.type]) {
        debug('present ' + doc.type + ' type entity', doc.id);
        return entities[doc.type].parse(doc, options);
      } else {
        debug('WARNING: ' + doc.type + ' type entity not found in');
        debug('  options  =>', options);
        debug('  document =>', doc);
        return DocumentEntity.parse(doc, options);
      }
    };

    const presentData = function (data) {
      if (Array.isArray(data)) {
        return data.map(presentEntity);
      } else {
        return presentEntity(data);
      }
    };

    if (hook.result) {
      if (hook.result.data) {
        hook.result.data = presentData(hook.result.data);
      } else {
        hook.result = presentData(hook.result);
      }
    }
    return hook;
  };
}
