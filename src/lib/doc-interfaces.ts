import {
  ResourceIdentifierObject,
  ResourceObject,
  AttributesObject
} from './json-api-interfaces';

import { ISourceReference } from 'typedoc/dist/lib/models/sources/file';
import { SourceDirectory } from 'typedoc/dist/lib/models/sources/directory';
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
  attributes: TSAttributesObject;
}

export type TSResourceIdentifierObject = ResourceIdentifierObject;

export interface TSType {
  name: string;
  link?: TSTypeLink;
  declaration?: TSResource;
  isArray: boolean;
  types?: TSType[]
}

export interface TSAttributesObject {
  name?: string;
  comment?: Comment;
  sources?: ISourceReference[];
  flags: TSResourceFlags;
  type?: TSType;
  slug: string;
  alias: string;
  packageInfo?: Object;
  readme?: string;
  implementedTypes?: TSType[];
  extendedTypes?: TSType[];
  fullName?: string;
  hierarchy?: string;

  constructors?: TSAttributesObject[];
  callSignatures?: TSAttributesObject[];
  properties?: TSAttributesObject[];
  parameters?: TSAttributesObject[];
  typeLiterals?: TSAttributesObject[];
  interfaces?: TSAttributesObject[];
  constructorSignatures?: TSAttributesObject[];
  indexSignatures?: TSAttributesObject[];
  typeAliases?: TSAttributesObject[];
  methods?: TSAttributesObject[];
  variables?: TSAttributesObject[];
  functions?: TSAttributesObject[];
  objectLiterals?: TSAttributesObject[];
  typeParameters?: TSAttributesObject[];
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

export type TSRelationship = 'callSignatures' |
  'parameters' |
  'typeLiterals' |
  'callSignatures' |
  'constructors' |
  'interfaces' |
  'constructorSignatures' |
  'typeAliases' |
  'indexSignatures' |
  'methods' |
  'properties' |
  'variables' |
  'functions' |
  'objectLiterals' |
  'typeParameters';

export function isValidRelationshipString(relationship: string) {
  return relationship === 'parameters' ||
    relationship === 'callSignatures' ||
    relationship === 'constructors' ||
    relationship === 'typeLiterals' ||
    relationship === 'interfaces' ||
    relationship === 'properties' ||
    relationship === 'constructors' ||
    relationship === 'constructorSignatures' ||
    relationship === 'typeAliases' ||
    relationship === 'indexSignatures' ||
    relationship === 'methods' ||
    relationship === 'properties' ||
    relationship === 'variables' ||
    relationship === 'functions' ||
    relationship === 'variables' ||
    relationship === 'objectLiterals' ||
    relationship === 'typeParameters';
}