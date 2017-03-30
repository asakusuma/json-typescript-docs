declare function require(name:string): any;

import {
  MenuConfig
} from './cli-interfaces';

import {
  TypeDocFilesJson,
  ProjectObject,
  ProjectDoc,
  TSAttributesObject,
  TSResource,
  TSType,
  TSRelationship,
  TSChild,
  TSResourceFlags,
  TSTypeLink,
  TSResourceIdentifierObject,
  ModuleIdMap,
  ProjectIdMap
} from './doc-interfaces';

import { ResourceIdentifierObject } from './json-api-interfaces';

import {
  resourceToIdentifier,
  slugify,
  camelify
} from './json-api-utils';

import { SourceReference } from 'typedoc/dist/lib/models/sources/file';

import { ProjectReflection } from 'typedoc/dist/lib/models/reflections/project';
import { Reflection, ReflectionKind } from 'typedoc/dist/lib/models/reflections/abstract';
import * as Reflections from 'typedoc/dist/lib/models/reflections/';
import * as Types from 'typedoc/dist/lib/models/types';
import { GroupPlugin } from 'typedoc/dist/lib/converter/plugins/GroupPlugin';

const marked = require('marked');

const kindMetaMap = {
  [ReflectionKind.Interface]: {
    normalize: true
  },
  [ReflectionKind.Class]: {
    normalize: true
  },
  [ReflectionKind.Function]: {
    normalize: true
  },
  [ReflectionKind.ClassOrInterface]: {
    normalize: true
  },
  [ReflectionKind.Global]: {
    normalize: true
  },
  [ReflectionKind.ExternalModule]: {
    normalize: true
  },
  [ReflectionKind.Module]: {
    normalize: true
  }
};

export var GLOBAL_ID_MAP: ProjectIdMap = {};

function registerId(id: string, type: string, slug: string, parent: Reflection) {
  if (parent && !parent.parent) {
    const parentId = parent.getAlias();
    (GLOBAL_ID_MAP[parentId] = GLOBAL_ID_MAP[parentId] || {})[slug] = id;
  }
}

function reflectionId(reflection: Reflection) {
  return String(reflection.id);
}

function reflectionType(reflection: Reflection) {
  return slugify(reflection.kindString || 'unknown');
}

function toTypeLink(reflection: Reflection) {
  const parent = reflection.parent;
  let link: TSTypeLink = {
    id: String(reflection.id),
    type: slugify(reflection.kindString),
    slug: reflection.getAlias(),
    sources: reflection.sources.map(flattenSource)
  };

  if (parent) {
    link.parent = {
      id: String(parent.id),
      type: parent.kindString ? slugify(parent.kindString) : String(parent.kind),
      slug: parent.getAlias(),
      sources: parent.sources ? parent.sources.map(flattenSource) : null
    }
  }

  return link;
}

function flattenSource(source: SourceReference) {
  let { fileName, line, character, url, file } = source;
  const fileUrl = file && file.url;
  const s: SourceReference = {
    fileName,
    line,
    character,
    url: url || fileUrl
  };

  return s;
}

function typeToJsonApi(type: Types.Type, recurse: boolean = true): TSType {
  let typeJson: TSType = {
    isArray: type.isArray,
    name: type.toString()
  };
  if (type instanceof Types.ReferenceType) {
    typeJson.name = type.name;
    if (type.reflection) {
      typeJson.link = toTypeLink(type.reflection);
    }
  } else if (type instanceof Types.ReflectionType) {
    const { resource } = extract(type.declaration)
    typeJson.declaration = resource;
  } else if (type instanceof Types.IntrinsicType) {
    typeJson.name = type.name;
  } else if (type instanceof Types.UnionType) {
    typeJson.types = type.types.map((type) => typeToJsonApi(type, false));
  } else if (type instanceof Types.TypeParameterType) {
    typeJson.name = type.name;
  } else if (type instanceof Types.StringLiteralType) {
    typeJson.name = type.value;
  } else if (type instanceof Types.UnknownType) {
    typeJson.name = type.name;
  } else if (type instanceof Types.TupleType) {
    typeJson.types = type.elements.map((type) => typeToJsonApi(type, false));
  }
  return typeJson;
}

function reflectionToJsonApi(reflection: Reflection): TSResource {
  const rootMeta = kindMetaMap[reflection.kind];
  const isNormalized = rootMeta && rootMeta.normalize;

  let flags: TSResourceFlags = {
    isNormalized,
    isExported: reflection.flags.isExported,
    isExternal: reflection.flags.isExternal,
    isOptional: reflection.flags.isOptional,
    isPrivate: reflection.flags.isPrivate,
    isPublic: reflection.flags.isPublic,
    isProtected: reflection.flags.isProtected,
    isRest: reflection.flags.isRest,
    isStatic: reflection.flags.isStatic,
  };

  const slug = reflection.getAlias();
  const alias = reflection.getAlias();
  const fullName = reflection.getFullName();
  const hierarchy = reflection.toStringHierarchy();
  const kindString = reflection.kindString;

  let attributes: TSAttributesObject = {
    name: reflection.name,
    slug,
    flags,
    alias,
    fullName,
    hierarchy,
    kindString
  };

  if (reflection instanceof Reflections.ProjectReflection) {
    const { packageInfo, readme } = reflection;
    attributes.packageInfo = packageInfo;
    attributes.readme = marked(readme);
  }

  if (reflection.comment) {
    const text = reflection.comment.text || reflection.comment.shortText;
    reflection.comment.shortText = marked(reflection.comment.shortText);
    reflection.comment.text = marked(text);
  }

  if (reflection instanceof Reflections.DeclarationReflection) {
    if (reflection.implementedTypes) {
      attributes.implementedTypes = reflection.implementedTypes.map((r) => typeToJsonApi(r))
    }
    if (reflection.extendedTypes) {
      attributes.extendedTypes = reflection.extendedTypes.map((r) => typeToJsonApi(r))
    }
  }

  if (reflection.sources) {
    attributes.sources = reflection.sources.map(flattenSource)
  }

  if (reflection.hasComment()) {
    attributes.comment = reflection.comment;
  }
  const type = reflectionType(reflection);
  const id = reflectionId(reflection);

  if (isNormalized) {
    registerId(id, type, slug, reflection.parent);
  }

  const resource: TSResource = {
    id,
    type,
    attributes
  };

  return resource;
}

function addRelationshipToResource(child: TSResource, relationship: string, resource: TSResource) {
  if (relationship === 'interfaces' || relationship === 'classes' || relationship === 'functions') {
    const resourceId: TSResourceIdentifierObject = {
      type: child.type,
      id: child.id
    };
    if (!resource.relationships) {
      resource.relationships = {};
    }
    if (resource.relationships[relationship]) {
      if (Array.isArray(resource.relationships[relationship].data)) {
        (<TSResourceIdentifierObject[]>(resource.relationships[relationship].data)).push(resourceId);
      }
    } else {
      resource.relationships[relationship] = {
        data: [resourceId]
      };
    }
  } else {
    console.info('Unknown relationship: ' + relationship);
  }
}

function addChildToResource(child: TSAttributesObject, relationship: string, resource: TSResource) {
  if (relationship === 'parameters' ||
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
    relationship === 'getSignatures' ||
    relationship === 'accessors' ||
    relationship === 'typeParameters') {
    _addChildToResource(child, relationship, resource);
  } else {
    console.info('Unknown child relationship: ' + relationship);
  }
}

function _addChildToResource(child: TSAttributesObject, relationship: TSChild, resource: TSResource) {
  if (resource.attributes[relationship]) {
    resource.attributes[relationship].push(child);
  } else {
    resource.attributes[relationship] = [child];
  }
}

interface ResourceExtraction {
  resource: TSResource,
  identifier: TSResourceIdentifierObject,
  normalized: boolean,
  included: TSResource[]
}

function extract(reflection: Reflection, recurse: boolean = true): ResourceExtraction {
  let extractedNormalized: TSResource[] = [];
  let extractedRoot = reflectionToJsonApi(reflection);

  const rootMeta = kindMetaMap[reflection.kind];
  const normalized = rootMeta && rootMeta.normalize;

  if (
    (reflection instanceof Reflections.TypeParameterReflection || 
    reflection instanceof Reflections.DeclarationReflection ||
    reflection instanceof Reflections.ParameterReflection ||
    reflection instanceof Reflections.SignatureReflection)
    && reflection.type
  ) {
    extractedRoot.attributes.typeInfo = typeToJsonApi(reflection.type, false);
  }

  if (reflection instanceof Reflections.DeclarationReflection && reflection.extendedTypes) {
    // We don't want to include information about base types like Element or Window
    recurse = recurse && !reflection.extendedTypes.some((type: any) => !type.reflection); 
  }
  
  if (recurse) {
    reflection.traverse((child) => {
      const meta = kindMetaMap[child.kind];
      const { normalized, resource, identifier, included } = extract(child);

      extractedNormalized = extractedNormalized.concat(included);
      
      if (meta && meta.normalize) {
        addRelationshipToResource(resource, camelify(GroupPlugin.getKindPlural(child.kind)), extractedRoot);
        extractedNormalized.push(resource);
      } else {
        addChildToResource(resource.attributes, camelify(GroupPlugin.getKindPlural(child.kind)), extractedRoot);
      }
    });
  }

  return {
    normalized,
    resource: extractedRoot,
    identifier: resourceToIdentifier(extractedRoot),
    included: extractedNormalized
  };
}

//projects.map(({ reflection }) => reflection)

export default function(projects: { menu: MenuConfig, reflection: ProjectReflection}[]) {
  let roots: TSResource[] = [];
  let resources: TSResource[] = [];

  for (let i = 0; i < projects.length; i++) {
    const { reflection, menu } = projects[i];

    if (reflection) {
      const { included, resource } = extract(reflection);

      resource.id = reflection.getAlias();
      resource.type = 'projectdoc';
      resource.attributes.menu = menu;

      roots.push(resource);
      resources.push(resource);

      resources = resources.concat(included);
    } else {
      console.log('Project could not be read');
    }
  }

  return {
    roots: roots.map(resourceToIdentifier),
    resources
  };
}

/*
[ 'name',
  'flags',
  'id',
  'parent',
  'originalName',
  'kind',
  'reflections',
  'symbolMapping',
  'directory',
  'files',
  'children',
  'readme',
  'packageInfo',
  'groups',
  'sources',
  'implementedTypes',
  'kindString',
  'typeHierarchy',
  'signatures',
  'parameters',
  'type',
  'defaultValue',
  'implementationOf',
  'implementedBy',
  'comment' ]
  */
