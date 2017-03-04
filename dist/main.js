"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var jsonfile_1 = require("jsonfile");
var json_api_transform_1 = require("./lib/json-api-transform");
if (process.argv.length < 3) {
    throw new Error('You must provide a path to the input typedoc JSON as the 1st argument');
}
else if (process.argv.length < 4) {
    throw new Error('You must provide an output path as the 2nd argument');
}
main(process.argv[2], process.argv[3]);
function main(inputPath, outputPath) {
    var manifestContents = fs_1.readFileSync('./data-sets/manifest.json', 'utf8');
    var fileContents = fs_1.readFileSync(inputPath, 'utf8');
    var doc = JSON.parse(fileContents);
    var manifest = JSON.parse(manifestContents);
    var docs = [doc];
    var transformed = json_api_transform_1.default(manifest, docs);
    jsonfile_1.writeFileSync(outputPath, transformed, { spaces: 2 });
}
