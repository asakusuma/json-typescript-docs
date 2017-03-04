import {
  TypeDocFilesJson,
  ProjectObject,
  ProjectDoc
} from './doc-interfaces';

import {
  ResourceObject
} from './json-api-interfaces';

import {
  resourceToIdentifier,
  slugify
} from './json-api-utils';

import { ProjectReflection } from 'typedoc';

export default function(typeDocJsonObjects: TypeDocFilesJson[]): ProjectObject {
  let roots: ProjectDoc[] = [];
  let resources: ResourceObject[] = [];

  for (let i = 0; i < typeDocJsonObjects.length; i++) {
    const tdObj = typeDocJsonObjects[i];
    const project: ProjectDoc = {
      id: slugify(tdObj.name),
      type: 'projectdoc',
      attributes: {
        name: tdObj.name
      }
    } 

    roots.push(project);
    resources.push(project);
  }

  return {
    roots: roots.map(resourceToIdentifier),
    resources
  };
}