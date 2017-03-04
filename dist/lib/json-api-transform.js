"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var slug_1 = require("slug");
var transform_projects_1 = require("./transform-projects");
function jsonApiTransform(manifest, typeDocJsonObjects) {
    var _a = transform_projects_1.default(typeDocJsonObjects), roots = _a.roots, resources = _a.resources;
    return {
        data: {
            id: slug_1.default(manifest.title),
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
