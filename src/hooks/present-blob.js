import fp from 'mostly-func';

import BatchEntity from '../entities/batch.entity';
import BlobEntity from '../entities/blob.entity';

export default function presentBlob (options = {}) {
  return async context => {
    options.provider = context.params.provider;

    if (context.result) {
      if (fp.hasProp('data', context.result)) {
        context.result.data = fp.map(doc => {
          return doc.blobs
            ? BatchEntity.parse(doc, options)
            : BlobEntity.parse(doc, options);
        }, context.result.data || []);
      } else {
        let doc = context.result;
        context.result = doc.blobs
          ? BatchEntity.parse(doc, options)
          : BlobEntity.parse(doc, options);
      }
    }
    
    return context;
  };
}