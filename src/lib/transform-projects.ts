import {
  TypeDocFilesJson,
  ProjectObject,
  ProjectDoc
} from './doc-interfaces';

import {
  ResourceObject,
  ResourceIdentifierObject,
  AttributesObject
} from './json-api-interfaces';

import {
  resourceToIdentifier,
  slugify
} from './json-api-utils';

import { ProjectReflection } from 'typedoc/dist/lib/models/reflections/project';
import { Reflection, ReflectionKind } from 'typedoc/dist/lib/models/reflections/abstract';
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

function typeToAttributes(type: Types.Type): AttributesObject {
  if (type instanceof Types.ReferenceType) {
    let attrs = type.toObject();
    if (type.reflection) {
      attrs.reflection = reflectionToJsonApi(type.reflection.toObject());
      // References with reflections shouldn't be normalized
      // so remove id to avoid confustion
      delete attrs.id;
    }
    return attrs;
  } else if (type instanceof Types.ReflectionType) {
    return reflectionToJsonApi(type.declaration);
  } else if (type instanceof Types.IntrinsicType) {
    return type;
  } else if (type instanceof Types.UnionType) {
    return {
      name: 'union',
      types: type.types.map(typeToJsonApi)
    };
  } else if (type instanceof Types.TypeParameterType) {
    return {};
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

interface TypeAttributesObject extends AttributesObject {
  isArray: boolean;
}

function typeToJsonApi(type: Types.Type): TypeAttributesObject {
  let attrs = typeToAttributes(type);
  attrs.isArray = type.isArray;
  return <TypeAttributesObject>attrs;
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

  if (reflection.type) {
    addSingleRelationshipToResource(typeToJsonApi(reflection.type), 'type', resource);
  }

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
  root: ResourceObject,
  normalized: ResourceObject[]
}

function extract(reflection: Reflection): ResourceExtraction {
  let extractedNormalized: ResourceObject[] = [];
  let extractedRoot = reflectionToJsonApi(reflection);

  for(var key in reflection) {
    const value = reflection[key];
    if (typeof value !== 'function') {
      KEYS[key] = value;
    }
  }
  
  reflection.traverse((child) => {
    const meta = kindMetaMap[child.kind];
    const { normalized, root } = extract(child);

    extractedNormalized = extractedNormalized.concat(normalized);
    
    if (meta && meta.normalize) {
      addRelationshipToResource(root, GroupPlugin.getKindPlural(child.kind), extractedRoot);
      extractedNormalized.push(root);
    } else {
      addChildToResource(root, GroupPlugin.getKindPlural(child.kind), extractedRoot);
    }
  });

  return {
    root: extractedRoot,
    normalized: extractedNormalized
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

    const { normalized } = extract(tdObj);

    resources = resources.concat(normalized);
  }

  return {
    roots: roots.map(resourceToIdentifier),
    resources
  };
}