export type ResourceId = string;
export type ResourceType = string;

export interface RelationshipEntry {
  links?: Object;
  data?: ResourceIdentifierObject | ResourceIdentifierObject[];
  meta?: Object;
}

export interface RelationshipsObject {
  [index: string]: RelationshipEntry;
}

export interface AttributesObject {
  [index: string]: any;
}

export interface ResourceIdentifierObject {
  type: ResourceType;
  id: ResourceId;
}

export interface ResourceObject extends ResourceIdentifierObject {
  attributes?: AttributesObject;
  relationships?: RelationshipsObject;
  links?: Object;
  meta?: Object;
}