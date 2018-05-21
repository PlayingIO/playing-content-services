import fp from 'mostly-func';

export default function isDocumentType (type) {
  return async context => {
    if (context.type === 'before') {
      return context.params.type === type;
    }

    if (context.type === 'after') {
      const result = fp.propOf('data', context.result);
      if (Array.isArray(result)) {
        return fp.reduce((acc, doc) =>
          acc && doc.type === type, true, result);
      } else {
        return result && result.type === type;
      }
    }
  };
}