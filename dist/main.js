"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var jsonfile_1 = require("jsonfile");
var walkSync = require('walk-sync');
var json_api_transform_1 = require("./lib/json-api-transform");
if (process.argv.length < 3) {
    throw new Error('You must provide a path to the input typedoc JSON as the 1st argument');
}
else if (process.argv.length < 4) {
    throw new Error('You must provide an output path as the 2nd argument');
}
var typedoc_1 = require("typedoc");
main(process.argv[2], process.argv[3]);
function oldMain(inputPath, outputPath) {
    var manifestContents = fs_1.readFileSync('./data-sets/manifest.json', 'utf8');
    var fileContents = fs_1.readFileSync(inputPath, 'utf8');
    var doc = JSON.parse(fileContents);
    var manifest = JSON.parse(manifestContents);
    var docs = [doc];
    var transformed = json_api_transform_1.default(manifest, docs);
    jsonfile_1.writeFileSync(outputPath, transformed, { spaces: 2 });
}
function main(inputPath, outputPath) {
    var app = new typedoc_1.Application({
        mode: 'File',
        logger: 'console',
        target: 'ES5',
        module: 'CommonJS',
    });
    var files = walkSync(inputPath, { directories: false }).map(function (path) { return inputPath + path; });
    var project = app.convert(files);
    console.log(project);
    app.generateJson(project, outputPath);
}
