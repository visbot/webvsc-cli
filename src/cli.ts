'use strict';

// Dependencies
import * as program from 'commander';
import { argv }from 'process';
import { lstat, readFile, statSync, writeFile } from 'fs';
import * as glob from 'glob';
import { basename, dirname, extname, join } from 'path';

// Modules
import { convertPreset } from '@visbot/webvsc';
// import { Arguments } from '@visbot/webvsc/lib/types';

const args = {
    verbose: 0,
    quiet: false
};

program
    .version(require('../package.json').version)
    .usage('[options] <file(s)>')
    .option('-v, --verbose <n>', 'control the amount of output displayed', parseInt)
    .option('-m, --minify', 'minify generated JSON')
    .option('-q, --quiet', 'print errors only')
    .option('-n, --no-hidden', 'don\'t extract hidden strings from fixed-size strings')
    .parse(argv);

const convert = (file: string, customArgs?): void => {
    (<any>Object).assign(args, customArgs);

    readFile(file, (error: Object, data: ArrayBuffer) => {
        if (args.quiet !== true) console.log(`\nReading "${file}"`);

        // File Meta
        let extName = extname(file);
        let baseName = basename(file, extName);
        let dirName = dirname(file);
        let outFile = join(dirName, baseName + '.webvs');
        let modifiedTime = statSync(file).mtime;

        let presetDate = modifiedTime.toISOString();

        let whitespace: number = (program.minify === true) ? 0 : 4;
        let presetObj = convertPreset(data, baseName, presetDate, args);
        let presetJson = JSON.stringify(presetObj, null, whitespace);

        if (args.quiet !== true) console.log(`Writing "${outFile}"`);

        writeFile(outFile, presetJson, (err) => {
          if (err) console.error(err);
        });
    });
};

if (program.args !== 'undefined' && program.args.length > 0) {
    program.args.forEach( (element: string, index: number) => {
        glob(element, (error: Error, files: string[]) => {
            if (error) throw error;

            files.forEach( file => {
                lstat(file, (error: Error, stats: {isFile}) => {
                    if (error) return;

                    if (stats.isFile()) {
                        convert(file, program);
                    }
                });
            });
        });
    });
}

if (program.args.length === 0) program.help();
