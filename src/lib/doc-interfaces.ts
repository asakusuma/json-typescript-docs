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

export interface TypeDocFilesJson {
  name: string,
  id: number,
  kind: number,
  flags: Object,
  children: any[]
  groups: any[]
}

export interface ProjectDoc extends ResourceObject {
  attributes: {
    name: string;
  }
}

export interface ProjectObject {
  roots: ResourceIdentifierObject[],
  resources: ResourceObject[]
}