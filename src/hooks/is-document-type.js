import fp from 'mostly-func';

export default function isDocumentType(type) {
  return (hook) => {
    if (hook.type === 'before') {
      return hook.params.type === type;
    }

    if (hook.type === 'after') {
      const result = hook.result && hook.result.data || hook.result;
      if (Array.isArray(result)) {
        return fp.reduce((acc, doc) =>
          acc && doc.type === type, true, result);
      } else {
        return result && result.type === type;
      }
    }
  };
}