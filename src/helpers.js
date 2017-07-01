import { isObject, map, omit } from 'lodash';

export function getBreadcrumbs(obj) {
  let breadcrumbs = [];
  let parent = obj.parent;
  while (parent && parent.path) {
    let bread = omit(parent, ['parent']);
    breadcrumbs = [bread, ...breadcrumbs];
    parent = parent.parent;
  }
  return breadcrumbs;
}