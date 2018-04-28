import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultEntities from '../entities';

const debug = makeDebug('playing:content-services:hooks:presentDocument');

// presentEntity by document type
export default function presentDocument (options = {}) {
  const entities = Object.assign(defaultEntities, options.entities);

  return (hook) => {
    const presentEntity = function (doc) {
      options.provider = hook.params.provider;

      if (doc.type && entities[fp.camelCase(doc.type)]) {
        debug('present ' + doc.type + ' type entity', doc.id);
        return entities[fp.camelCase(doc.type)].parse(doc, options);
      } else {
        debug('WARNING: ' + doc.type + ' type entity not found in');
        debug('  options  =>', options);
        debug('  document =>', doc);
        return entities.document.parse(doc, options);
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
