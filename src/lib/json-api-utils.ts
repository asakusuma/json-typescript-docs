import {
  ResourceIdentifierObject, ResourceObject
} from './json-api-interfaces';

export function resourceToIdentifier(obj: ResourceObject): ResourceIdentifierObject {
  return {
    id: obj.id,
    type: obj.type
  };
}

export function urlSafe(str) {
  return str.replace('@','').replace('/','-');
}

export function slugify(str: string) {
  return urlSafe(str.replace(' ', '-').toLocaleLowerCase());
}

export function camelify(str: string) {
  let string = str.toLowerCase().split(' ').map((word) => word.slice(0,1).toUpperCase() + word.slice(1)).join('');
  return string.slice(0,1).toLowerCase() + string.slice(1);
}