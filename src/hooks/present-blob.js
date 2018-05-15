import fp from 'mostly-func';

import BatchEntity from '../../entities/batch.entity';
import BlobEntity from '../../entities/blob.entity';

export default function presentBlob (options = {}) {
  return (context) => {
    options.provider = context.params.provider;

    if (context.result) {
      if (context.result.data) {
        context.result.data = context.result.data.map(doc => {
          return doc.blobs
            ? BatchEntity.parse(doc, options)
            : BlobEntity.parse(doc, options);
        });
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