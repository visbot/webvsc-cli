'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
const glob = require("glob");
const program = require("commander");
const logSymbols = require("log-symbols");
const process_1 = require("process");
const path_1 = require("path");
const graceful_fs_1 = require("graceful-fs");
const util_1 = require("util");
const writeFileAsync = util_1.promisify(graceful_fs_1.writeFile);
// Modules
const webvsc_1 = require("@visbot/webvsc");
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
    .parse(process_1.argv);
const convert = (file, customArgs) => __awaiter(this, void 0, void 0, function* () {
    if (customArgs.date === false) {
        customArgs.noDate = true;
        delete customArgs.date;
    }
    Object.assign(args, customArgs);
    // File Meta
    let extName = path_1.extname(file);
    let baseName = path_1.basename(file, extName);
    let dirName = path_1.dirname(file);
    let outFile = path_1.join(dirName, baseName + '.webvs');
    let output;
    try {
        if (args.quiet !== true)
            console.log(`${logSymbols.success} Reading "${file}"`);
        output = yield webvsc_1.convertFile(file, args);
    }
    catch (err) {
        if (args.quiet !== true)
            console.error(`${logSymbols.error} Reading "${file}"`);
        console.error(err);
    }
    try {
        if (args.quiet !== true)
            console.log(`${logSymbols.success} Writing "${outFile}"`);
        yield writeFileAsync(outFile, output);
    }
    catch (err) {
        if (args.quiet !== true)
            console.error(`${logSymbols.error} Writing "${outFile}"`);
        console.error(err);
    }
});
if (typeof program.args !== 'undefined' && program.args.length > 0) {
    program.args.forEach((element, index) => {
        glob(element, (error, files) => {
            if (error)
                throw error;
            files.forEach(file => {
                graceful_fs_1.lstat(file, (error, stats) => {
                    if (error)
                        return;
                    if (stats.isFile()) {
                        convert(file, program);
                    }
                });
            });
        });
    });
}
if (program.args.length === 0)
    program.help();
//# sourceMappingURL=cli.js.map