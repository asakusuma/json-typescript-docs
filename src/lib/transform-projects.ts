import {
  TypeDocFilesJson,
  ProjectObject
} from './doc-interfaces';

export default function(typeDocJsonObjects: TypeDocFilesJson[]): ProjectObject {
  return {
    roots: [],
    resources: []
  };
}