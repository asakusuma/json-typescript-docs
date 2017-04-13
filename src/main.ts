#!/usr/bin/env node
import { writeFileSync } from "fs";
import path = require('path');
const walkSync: (path: string, options?: any) => string[] = require('walk-sync');

import { readFileSync } from "fs";

import transform from './lib/json-api-transform';
import { err, log } from './lib/logging';

if (process.argv.length < 3) {
    throw new Error('You must provide a path to the config');
}

import { Application } from 'typedoc';
import { Config } from './lib/cli-interfaces';

main(process.argv[2], process.argv[3]);

function main(inputPath: string, outputPath: string) {
    const configFile = readFileSync(inputPath, 'utf8');
    const config = <Config>JSON.parse(configFile);

    const app = new Application({
        mode:   'File',
        logger: 'console',
        target: 'ES6',
        module: 'CommonJS',
        experimentalDecorators: true
    });

    const projects = config.projects.map((project) => {
        let files = (walkSync(project.src, { directories: false }) as string[])
            .map((file: string) => path.join(project.src, file))
            .filter(filePath => path.extname(filePath) === '.ts');

        let converted = app.convert(files);
        const menu = project.menu || {};
        return {
            menu,
            reflection: converted
        };
    });

    const transformed = transform(config.manifest, projects);
    const out = config.output || outputPath;
    writeFileSync(out, JSON.stringify(transformed, null, 2));
    console.log('Output file saved to: ' + out);
}

export * from './lib/json-api-interfaces';
export * from './lib/doc-interfaces';
export * from './lib/cli-interfaces';