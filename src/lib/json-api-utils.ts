import {
  ResourceIdentifierObject, ResourceObject
} from './json-api-interfaces';

export function resourceToIdentifier(obj: ResourceObject): ResourceIdentifierObject {
  return {
    id: obj.id,
    type: obj.type
  };
}

export function slugify(str: string) {
  return str.replace(' ', '-').toLocaleLowerCase();
}

export function camelify(str: string) {
  return str.toLowerCase().split(' ').map((word) => word.slice(0,1).toUpperCase() + word.slice(1)).join();
}