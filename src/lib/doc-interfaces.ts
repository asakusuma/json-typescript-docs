import {
  ResourceIdentifierObject, ResourceObject
} from './json-api-interfaces';

export interface DocSetManifest {
  title: string;
  intro: string;
}

export interface DocSetJsonApi {
  data?: ResourceObject | ResourceObject[] | ResourceIdentifierObject | ResourceIdentifierObject[];
  included?: Array<ResourceObject>;
}

export interface TypeDocFilesJson {}

export interface ProjectDoc extends ResourceObject {
  attributes: {
    name: string;
  }
}

export interface ProjectObject {
  roots: ResourceIdentifierObject[],
  resources: ResourceObject[]
}