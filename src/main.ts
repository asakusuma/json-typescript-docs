#!/usr/bin/env node

import { writeFileSync } from 'jsonfile';
import walkSync = require('walk-sync');
import path = require('path');

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
    });

    const projects = config.projects.map((project) => {
        let files = (walkSync(project.src, { directories: false }) as string[])
            .map((path: string) => project.src + path)
            .filter(filePath => path.extname(filePath) === '.ts');

        let converted = app.convert(files);
        if (project.include) {
            converted.children = converted.children.filter(child => {
                return project.include.indexOf(child.name) > -1;
            });
        }
        if (project.exclude) {
            converted.children = converted.children.filter(child => {
                return project.exclude.indexOf(child.name) < 0;
            });
        }
        return converted;
    });

    const transformed = transform(config.manifest, projects);
    const out = config.output || outputPath;
    writeFileSync(out, transformed, { spaces: 2 });
    console.log('Output file saved to: ' + out);
}
