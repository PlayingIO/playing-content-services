import makeDebug from 'debug';
import fp from 'mostly-func';

import defaultEntities from '../entities';

const debug = makeDebug('playing:content-services:hooks:presentDocument');

// presentEntity by document type
export default function presentDocument (options = {}) {
  const entities = Object.assign(defaultEntities, options.entities);

  return async context => {
    const presentEntity = function (doc) {
      options.provider = context.params.provider;

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

    if (context.result) {
      if (context.result.data) {
        context.result.data = presentData(context.result.data);
      } else {
        context.result = presentData(context.result);
      }
    }
    return context;
  };
}
