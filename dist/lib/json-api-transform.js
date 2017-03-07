"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var json_api_utils_1 = require("./json-api-utils");
var transform_projects_1 = require("./transform-projects");
function jsonApiTransform(manifest, projects) {
    var _a = transform_projects_1.default(projects), roots = _a.roots, resources = _a.resources;
    return {
        data: {
            id: json_api_utils_1.slugify(manifest.title),
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
exports.default = jsonApiTransform;
