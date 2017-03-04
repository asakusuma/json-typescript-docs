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