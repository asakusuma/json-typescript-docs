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

function extract(reflection: Reflection, includeRoot: boolean = true): ResourceObject[] {
  let resources: ResourceObject[] = [];
  const root = reflectionToJsonApi(reflection);
  const meta = kindMetaMap[reflection.kind];
  const shouldNormalize = meta && meta.normalize;

  if (includeRoot) {
    resources.push(root);
  }
  
  reflection.traverse((child) => {
    const meta = kindMetaMap[child.kind];
    const extracted = extract(child);
    
    if (meta && meta.normalize && shouldNormalize) {
      for (let i = 0; i < extracted.length; i++) {
        addRelationshipToResource(extracted[i], GroupPlugin.getKindPlural(child.kind), root);
      }
      resources = resources.concat(extracted);
    } else {
      addChildToResource(extracted[0], GroupPlugin.getKindPlural(child.kind), root);
    }
  });

  return resources;
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

    const flattened = extract(tdObj, false);

    resources = resources.concat(flattened);
  }

  return {
    roots: roots.map(resourceToIdentifier),
    resources
  };
}