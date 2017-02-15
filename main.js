var fs = require('fs');
var transform = require('./lib/transform');
var jsonfile = require('jsonfile');

if (process.argv.length < 3) {
    throw new Error('You must provide a path to the input typedoc JSON as the 1st argument');
} else if (process.argv.length < 4) {
    throw new Error('You must provide an output path as the 2nd argument');
}

main(process.argv[2], process.argv[3]);

function main(inputPath, outputPath) {
    const fileContents = fs.readFileSync(inputPath, 'utf8');
    const docs = JSON.parse(fileContents);
    const transformed = transform(docs);
    
    jsonfile.writeFileSync(outputPath, transformed, {spaces: 2});
}