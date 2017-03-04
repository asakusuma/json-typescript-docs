import { readFileSync } from "fs";
import { writeFileSync } from 'jsonfile';

import transform from './lib/json-api-transform';

if (process.argv.length < 3) {
    throw new Error('You must provide a path to the input typedoc JSON as the 1st argument');
} else if (process.argv.length < 4) {
    throw new Error('You must provide an output path as the 2nd argument');
}

main(process.argv[2], process.argv[3]);

function main(inputPath, outputPath) {
    const manifestContents = readFileSync('./data-sets/manifest.json', 'utf8');
    const fileContents = readFileSync(inputPath, 'utf8');
    const doc = JSON.parse(fileContents);

    const manifest = JSON.parse(manifestContents);
    const docs = [doc];

    const transformed = transform(manifest, docs);
    
    writeFileSync(outputPath, transformed, { spaces: 2 });
}