import fp from 'mostly-func';

export default function isDocumentType (type) {
  return (context) => {
    if (context.type === 'before') {
      return context.params.type === type;
    }

    if (context.type === 'after') {
      const result = context.result && context.result.data || context.result;
      if (Array.isArray(result)) {
        return fp.reduce((acc, doc) =>
          acc && doc.type === type, true, result);
      } else {
        return result && result.type === type;
      }
    }
  };
}