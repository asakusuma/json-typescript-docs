"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resourceToIdentifier(obj) {
    return {
        id: obj.id,
        type: obj.type
    };
}
exports.resourceToIdentifier = resourceToIdentifier;
function slugify(str) {
    return str.replace(' ', '-').toLocaleLowerCase();
}
exports.slugify = slugify;
