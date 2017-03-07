import {
  TypeDocFilesJson,
  ProjectObject,
  ProjectDoc
} from './doc-interfaces';

import {
  ResourceObject,
  ResourceIdentifierObject
} from './json-api-interfaces';

import {
  resourceToIdentifier,
  slugify
} from './json-api-utils';

import { ProjectReflection } from 'typedoc/dist/lib/models/reflections/project';
import { Reflection, ReflectionKind } from 'typedoc/dist/lib/models/reflections/abstract';
import { GroupPlugin } from 'typedoc/dist/lib/converter/plugins/GroupPlugin';


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

function reflectionToJsonApi(reflection: Reflection): ResourceObject {
  return {
    type: slugify(reflection.kindString || 'unknown'),
    id: String(reflection.id),
    attributes: {
      name: reflection.name
    }
  };
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