'use strict';

// Dependencies
import * as program from 'commander';
import { argv }from 'process';
import { lstat, writeFile } from 'fs';
import * as glob from 'glob';
import { basename, dirname, join } from 'path';

// Modules
import { convertPreset } from '@visbot/webvsc/lib/convert';
import { Arguments } from '@visbot/webvsc/lib/types';

program
    .version(require('../package.json').version)
    .usage('[options] <file(s)>')
    .option('-v, --verbose <int>', 'print more information, can be set multiple times to increase output', (d, t: number): number => { return t + 1; }, 0)
    .option('-m, --minify', 'minify generated JSON')
    .option('-q, --quiet', 'print errors only')
    .option('-n, --no-hidden', 'don\'t extract hidden strings from fixed-size strings')
    .parse(argv);

const convert = (file: string, args: Arguments): void => {
    if (args.quiet !== true) console.log(`\nReading "${file}"`);
    let presetObj = convertPreset(file, args);

    let whitespace: number = (program.minify === true) ? 0 : 4;
    let presetJson = JSON.stringify(presetObj, null, whitespace);

    let baseName = basename(file, '.avs');
    let dirName = dirname(file);
    let outFile = join(dirName, baseName + '.webvs');

    writeFile(outFile, presetJson, (err) => {
      if (err) console.error(err);
      if (args.quiet !== true) console.log(`Writing "${outFile}"`);
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
