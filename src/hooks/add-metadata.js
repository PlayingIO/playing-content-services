import fp from 'mostly-func';
import { iff, isProvider } from 'feathers-hooks-common';
import { hooks } from 'mostly-feathers-mongoose';

export default function addMetadata (key, values) {
  return iff(isProvider('external'), hooks.mapHookData(item => {
    if (item) {
      item.metadata = item.metadata || {};
      if (Array.isArray(values)) {
        item.metadata[key] = fp.concat(item.metadata[key] || [], values);
      } else {
        item.metadata[key] = fp.merge((item.metadata[key] || {}), values);
      }
    }
    return item;
  }));
}