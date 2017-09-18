import fp from 'mostly-func';

export default function isDocument() {
  return (hook) => {
    if (hook.type === 'before') {
      return hook.params.type === 'document';
    }
    if (hook.type === 'after') {
      const result = hook.result && hook.result.data || hook.result;
      if (Array.isArray(result)) {
        return fp.reduce((acc, doc) =>
          acc && doc.type === 'document', true, result);
      } else {
        return result && result.type === 'document';
      }
    }
  };
}