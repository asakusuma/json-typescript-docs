#!/usr/bin/env node
import { writeFileSync, readFileSync, statSync } from "fs";
import * as ts from "typescript";
import path = require('path');
const walkSync: (path: string, options?: any) => string[] = require('walk-sync');

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
        target: 'es2015',
        module: 'commonjs',
        experimentalDecorators: true
    });

    const projects = config.projects.map((project) => {
        let src = path.resolve(project.src);
        let stat = statSync(project.src);

        let config = {
            compilerOptions: {
                target: 'es2015',
                module: 'commonjs',
                experimentalDecorators: true
            }
        };
        let configFileName: string = undefined;
        let basedir = src;
        if (stat.isFile()) {
            let res = ts.readConfigFile(src, ts.sys.readFile);
            if (res.error) {
                throw new Error(ts.formatDiagnostics([res.error], undefined));
            }
            config = res.config;
            configFileName = src;
            basedir = path.dirname(src);
        }

        let res = ts.parseJsonConfigFileContent(config, ts.sys, basedir, undefined, configFileName);
        if (res.errors.length > 0) {
            throw new Error(ts.formatDiagnostics(res.errors, undefined));
        }

        let options = res.options;
        let rootNames = res.fileNames;
        let host = ts.createCompilerHost(options);
        let cache = ts.createModuleResolutionCache(host.getCurrentDirectory(), host.getCanonicalFileName);
        let importMap: {
            [containingFile: string]: ts.ResolvedModule[];
        } = Object.create(null);

        host.resolveModuleNames = (moduleNames: string[], containingFile) => {
            let resolutions = moduleNames.map((moduleName) => {
                let resolution = ts.resolveModuleName(moduleName, containingFile, options, host, cache);
                return resolution.resolvedModule;
            });
            importMap[containingFile] = resolutions;
            return resolutions;
        };

        let program = ts.createProgram(rootNames, options, host);

        let seen: {
           [path: string]: boolean;
        } = Object.create(null);
        let files: string[] = [];
        let queue: ts.SourceFile[] = [];

        rootNames.map(fileName => {
            queue.push(program.getSourceFile(fileName));
        });

        while (queue.length) {
            let sourceFile = queue.pop();
            seen[sourceFile.path] = true;
            files.push(sourceFile.fileName);
            let imports = importMap[sourceFile.fileName];
            if (imports) {
                imports.forEach((moduleResolution) => {
                    if (moduleResolution && !moduleResolution.isExternalLibraryImport) {
                        let sourceFile = program.getSourceFile(moduleResolution.resolvedFileName);
                        if (!seen[sourceFile.path]) {
                            queue.push(sourceFile);
                        }
                    }
                });
            }
        }

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