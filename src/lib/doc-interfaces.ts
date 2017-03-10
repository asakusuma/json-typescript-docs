import {
  ResourceIdentifierObject,
  ResourceObject,
  AttributesObject
} from './json-api-interfaces';

import { ISourceReference } from 'typedoc/dist/lib/models/sources/file';
import { Comment } from 'typedoc/dist/lib/models/comments/comment';

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

export interface TSResource extends ResourceObject {
  attributes?: AttributesObject;
}

export interface TSType {
  type: string;
  name: string;
  reflection?: ResourceIdentifierObject;
  isArray: boolean;
}

export interface TSAttributesObject extends AttributesObject {
  name?: string;
  comment?: Comment;
  sources?: ISourceReference[];
  constructors?: TSResource[];
  callSignatures?: TSResource[];
  properties?: TSResource[];
  parameters?: TSResource[];
  type?: TSType;
  slug: string;
  alias: string;
}

export interface TSResourceFlags {
  isPrivate: boolean;
  isProtected: boolean;
  isPublic: boolean;
  isStatic: boolean;
  isExported: boolean;
  isExternal: boolean;
  isOptional: boolean;
  isRest: boolean;
  isNormalized: boolean;
}

export interface TSTypeLink {
  id: string,
  type: string;
  slug: string;
  sources: ISourceReference[],
  parent?: TSTypeLink
};