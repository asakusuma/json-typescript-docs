import {
  DocSetManifest,
  TypeDocFilesJson,
  DocSetJsonApi
} from './doc-interfaces';

import {
  slugify
} from './json-api-utils';

import transformProjects from './transform-projects';

export default function jsonApiTransform(manifest: DocSetManifest, typeDocJsonObjects: TypeDocFilesJson[]): DocSetJsonApi {

  const {
    roots,
    resources
  } = transformProjects(typeDocJsonObjects);

  return {
    data: {
      id: slugify(manifest.title),
      type: 'docset',
      attributes: manifest,
      relationships: {
        docmodules: {
          data: roots
        }
      }
    },
    included: resources
  };
}