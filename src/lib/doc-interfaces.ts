import {
  ResourceIdentifierObject,
  ResourceObject,
  AttributesObject,
  RelationshipEntry,
  RelationshipsObject
} from './json-api-interfaces';

import { ISourceReference } from 'typedoc/dist/lib/models/sources/file';
import { SourceDirectory } from 'typedoc/dist/lib/models/sources/directory';
import { Comment } from 'typedoc/dist/lib/models/comments/comment';

export interface OutputRoot {
  data: {
    id: string;
    type: string;
    attributes: RootAttributes,
    relationships: {
      docmodules: {
        data: ResourceIdentifierObject[]
      }
    }
  },
  included: TSResource[]
}

export interface RootAttributes extends DocSetManifest {
  idMap: ProjectIdMap
}

export interface ModuleIdMap {
  [index: string]: string;
}

export interface ProjectIdMap {
  [index: string]: ModuleIdMap;
}

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

export interface TSRelationshipsObject extends RelationshipsObject {
  classes?: RelationshipEntry;
  interfaces?: RelationshipEntry;
}

export interface TSResource extends ResourceObject {
  attributes: TSAttributesObject;
  relationships?: TSRelationshipsObject;
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
  kindString: string;
  slug: string;
  alias: string;
  flags: TSResourceFlags;
  name: string;
  
  comment?: Comment;
  sources?: ISourceReference[];
  type?: TSType;
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

export type TSRelationship = 'interfaces' | 'classs';

export type TSChild = 'callSignatures' |
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