import {
  TypeDocFilesJson,
  ProjectObject,
  ProjectDoc,
  TSAttributesObject,
  TSResource,
  TSType
} from './doc-interfaces';

import {
  ResourceObject,
  ResourceIdentifierObject,
  AttributesObject
} from './json-api-interfaces';

import {
  resourceToIdentifier,
  slugify,
  camelify
} from './json-api-utils';

import { ProjectReflection } from 'typedoc/dist/lib/models/reflections/project';
import { Reflection, ReflectionKind } from 'typedoc/dist/lib/models/reflections/abstract';
import * as Reflections from 'typedoc/dist/lib/models/reflections/';
import * as Types from 'typedoc/dist/lib/models/types';
import { GroupPlugin } from 'typedoc/dist/lib/converter/plugins/GroupPlugin';

let KEYS = {};

const kindMetaMap = {
  [ReflectionKind.Interface]: {
    normalize: true
  },
  [ReflectionKind.Class]: {
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

type AnyReflection = Reflection;

function reflectionId(reflection: Reflection) {
  return String(reflection.id);
}

function reflectionType(reflection: Reflection) {
  return slugify(reflection.kindString || 'unknown');
}

function typeToAttributes(type: Types.Type, recurse: boolean = true): AttributesObject {
  if (type instanceof Types.ReferenceType) {
    let attrs = type.toObject();
    if (type.reflection) {
      let { resource, identifier, normalized } = extract(type.reflection, recurse);
      attrs.reflection = normalized ? identifier : resource;
      // References with reflections shouldn't be normalized
      // so remove id to avoid confustion
      delete attrs.id;
    }
    return attrs;
  } else if (type instanceof Types.ReflectionType) {
    const { resource, identifier, normalized } = extract(type.declaration, recurse);
    return normalized ? identifier : resource;
  } else if (type instanceof Types.IntrinsicType) {
    return type;
  } else if (type instanceof Types.UnionType) {
    return {
      name: 'union',
      types: type.types.map((type) => typeToJsonApi(type, false))
    };
  } else if (type instanceof Types.TypeParameterType) {
    return type;
  } else if (type instanceof Types.StringLiteralType) {
    return type;
  } else if (type instanceof Types.UnknownType) {
    return type;
  } else if (type instanceof Types.TupleType) {
    return type;
  }
  // TODO: add logging to say unknown type
  return type;
}

function typeToJsonApi(type: Types.Type, recurse: boolean = true): TSType {
  let attrs = typeToAttributes(type, recurse);
  attrs.isArray = type.isArray;
  return <TSType>attrs;
}

function reflectionToJsonApi(reflection): ResourceObject {
  let attributes: AttributesObject = {
    name: reflection.name
  };

  let resource: ResourceObject = {
    id: reflectionId(reflection),
    type: reflectionType(reflection),
    attributes
  };

  return resource;
}

function addRelationshipToResource(child: ResourceObject, relationship: string, resource: ResourceObject) {
  const resourceId: ResourceIdentifierObject = {
    type: child.type,
    id: child.id
  };
  if (!resource.relationships) {
    resource.relationships = {};
  }
  if (resource.relationships[relationship]) {
    if (Array.isArray(resource.relationships[relationship].data)) {
      (<ResourceIdentifierObject[]>(resource.relationships[relationship].data)).push(resourceId);
    }
  } else {
    resource.relationships[relationship] = {
      data: [resourceId]
    };
  }
}

function addSingleRelationshipToResource(child: AttributesObject | ResourceObject, relationship: string, resource: ResourceObject) {
  resource.attributes[relationship] = child;
}

function addChildToResource(child: ResourceObject, relationship: string, resource: ResourceObject) {
  if (resource.attributes[relationship]) {
    resource.attributes[relationship].push(child);
  } else {
    resource.attributes[relationship] = [child];
  }
}

interface ResourceExtraction {
  resource: TSResource,
  identifier: ResourceIdentifierObject,
  normalized: boolean,
  included: ResourceObject[]
}

function extract(reflection: Reflection, recurse: boolean = true): ResourceExtraction {
  let extractedNormalized: ResourceObject[] = [];
  let extractedRoot = reflectionToJsonApi(reflection);

  if (extractedRoot.attributes.name === 'PackageDefinition') {
    console.log(reflection);
  }

  const rootMeta = kindMetaMap[reflection.kind];

  for(var key in reflection) {
    const value = reflection[key];
    if (typeof value !== 'function') {
      KEYS[key] = value;
    }
  }

  if (
    (reflection instanceof Reflections.TypeParameterReflection || 
    reflection instanceof Reflections.DeclarationReflection ||
    reflection instanceof Reflections.ParameterReflection ||
    reflection instanceof Reflections.SignatureReflection)
    && reflection.type
  ) {
    addSingleRelationshipToResource(typeToJsonApi(reflection.type, false), 'type', extractedRoot);
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
        addChildToResource(resource, camelify(GroupPlugin.getKindPlural(child.kind)), extractedRoot);
      }
    });
  }

  return {
    normalized: rootMeta && rootMeta.normalize,
    resource: extractedRoot,
    identifier: resourceToIdentifier(extractedRoot),
    included: extractedNormalized
  };
}

export default function(projects: ProjectReflection[]) {
  let roots: ProjectDoc[] = [];
  let resources: ResourceObject[] = [];

  for (let i = 0; i < projects.length; i++) {
    const tdObj = projects[i];
    const project: ProjectDoc = {
      id: slugify(tdObj.name),
      type: 'projectdoc',
      attributes: {
        name: tdObj.name
      }
    };

    roots.push(project);
    resources.push(project);

    const { included } = extract(tdObj);

    resources = resources.concat(included);
  }
  console.log(Object.keys(KEYS));
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