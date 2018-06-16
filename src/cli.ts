'use strict';

// Dependencies
import * as glob from 'glob';
import * as program from 'commander';
import * as logSymbols from 'log-symbols';
import { argv }from 'process';
import { basename, dirname, extname, join } from 'path';
import { lstat, writeFile } from 'graceful-fs';
import { promisify } from 'util';

const writeFileAsync = promisify(writeFile);

// Modules
import { convertFile } from '@visbot/webvsc';

const args = {
    hidden: true,
    quiet: false,
    verbose: 0
};

program
    .version(require('../package.json').version)
    .usage('[options] <file(s)>')
    .option('-v, --verbose <n>', 'control the amount of output displayed', parseInt)
    .option('-m, --minify', 'minify generated JSON')
    .option('-q, --quiet', 'print errors only')
    .option('-D, --no-date', 'don\'t create date from file meta')
    .option('-H, --no-hidden', 'don\'t extract hidden strings from fixed-size strings')
    .parse(argv);

const convert = async (file: string, customArgs?) => {
    if (customArgs.date === false) {
      customArgs.noDate = true;
      delete customArgs.date;
    }

    (<any>Object).assign(args, customArgs);

      // File Meta
      let extName = extname(file);
      let baseName = basename(file, extName);
      let dirName = dirname(file);
      let outFile = join(dirName, baseName + '.webvs');
      let output;

      try {
        if (args.quiet !== true) console.log(`${logSymbols.success} Reading "${file}"`);
        output = await convertFile(file, args);
      } catch (err) {
        if (args.quiet !== true) console.error(`${logSymbols.error} Reading "${file}"`);
        console.error(err);
      }

      try {
        if (args.quiet !== true) console.log(`${logSymbols.success} Writing "${outFile}"`);
        await writeFileAsync(outFile, output);
      } catch (err) {
        if (args.quiet !== true) console.error(`${logSymbols.error} Writing "${outFile}"`);
        console.error(err);
      }
};

if (typeof program.args !== 'undefined' && program.args.length > 0) {
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
