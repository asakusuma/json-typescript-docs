"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var json_api_utils_1 = require("./json-api-utils");
var abstract_1 = require("typedoc/dist/lib/models/reflections/abstract");
var GroupPlugin_1 = require("typedoc/dist/lib/converter/plugins/GroupPlugin");
var kindMetaMap = (_a = {},
    _a[abstract_1.ReflectionKind.Interface] = {
        normalize: true
    },
    _a[abstract_1.ReflectionKind.Class] = {
        normalize: true
    },
    _a[abstract_1.ReflectionKind.ClassOrInterface] = {
        normalize: true
    },
    _a[abstract_1.ReflectionKind.Global] = {
        normalize: true
    },
    _a[abstract_1.ReflectionKind.ExternalModule] = {
        normalize: true
    },
    _a[abstract_1.ReflectionKind.Module] = {
        normalize: true
    },
    _a);
function reflectionToJsonApi(reflection) {
    return {
        type: json_api_utils_1.slugify(reflection.kindString || 'unknown'),
        id: String(reflection.id),
        attributes: {
            name: reflection.name
        }
    };
}
function addRelationshipToResource(child, relationship, resource) {
    var resourceId = {
        type: child.type,
        id: child.id
    };
    if (!resource.relationships) {
        resource.relationships = {};
    }
    if (resource.relationships[relationship]) {
        if (Array.isArray(resource.relationships[relationship].data)) {
            (resource.relationships[relationship].data).push(resourceId);
        }
    }
    else {
        resource.relationships[relationship] = {
            data: [resourceId]
        };
    }
}
function addChildToResource(child, relationship, resource) {
    if (resource.attributes[relationship]) {
        resource.attributes[relationship].push(child);
    }
    else {
        resource.attributes[relationship] = [child];
    }
}
function extract(reflection, includeRoot) {
    if (includeRoot === void 0) { includeRoot = true; }
    var resources = [];
    var root = reflectionToJsonApi(reflection);
    var meta = kindMetaMap[reflection.kind];
    var shouldNormalize = meta && meta.normalize;
    if (includeRoot) {
        resources.push(root);
    }
    reflection.traverse(function (child) {
        var meta = kindMetaMap[child.kind];
        var extracted = extract(child);
        if (meta && meta.normalize && shouldNormalize) {
            for (var i = 0; i < extracted.length; i++) {
                addRelationshipToResource(extracted[i], GroupPlugin_1.GroupPlugin.getKindPlural(child.kind), root);
            }
            resources = resources.concat(extracted);
        }
        else {
            addChildToResource(extracted[0], GroupPlugin_1.GroupPlugin.getKindPlural(child.kind), root);
        }
    });
    return resources;
}
function default_1(projects) {
    var roots = [];
    var resources = [];
    for (var i = 0; i < projects.length; i++) {
        var tdObj = projects[i];
        var project = {
            id: json_api_utils_1.slugify(tdObj.name),
            type: 'projectdoc',
            attributes: {
                name: tdObj.name
            }
        };
        roots.push(project);
        resources.push(project);
        var flattened = extract(tdObj, false);
        resources = resources.concat(flattened);
    }
    return {
        roots: roots.map(json_api_utils_1.resourceToIdentifier),
        resources: resources
    };
}
exports.default = default_1;
var _a;
