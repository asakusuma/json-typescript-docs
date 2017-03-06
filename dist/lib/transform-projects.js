"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var json_api_utils_1 = require("./json-api-utils");
function default_1(typeDocJsonObjects) {
    var roots = [];
    var resources = [];
    for (var i = 0; i < typeDocJsonObjects.length; i++) {
        var tdObj = typeDocJsonObjects[i];
        var project = {
            id: json_api_utils_1.slugify(tdObj.name),
            type: 'projectdoc',
            attributes: {
                name: tdObj.name
            }
        };
        roots.push(project);
        resources.push(project);
        console.log(tdObj);
    }
    return {
        roots: roots.map(json_api_utils_1.resourceToIdentifier),
        resources: resources
    };
}
exports.default = default_1;
