'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var program = require("commander");
var process_1 = require("process");
var graceful_fs_1 = require("graceful-fs");
var glob = require("glob");
var path_1 = require("path");
// Modules
var webvsc_1 = require("@visbot/webvsc");
// import { Arguments } from '@visbot/webvsc/lib/types';
var args = {
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
    .parse(process_1.argv);
var convert = function (file, customArgs) {
    Object.assign(args, customArgs);
    graceful_fs_1.readFile(file, function (error, data) {
        if (args.quiet !== true)
            console.log("\nReading \"" + file + "\"");
        // File Meta
        var extName = path_1.extname(file);
        var baseName = path_1.basename(file, extName);
        var dirName = path_1.dirname(file);
        var outFile = path_1.join(dirName, baseName + '.webvs');
        var modifiedTime = graceful_fs_1.statSync(file).mtime;
        var presetDate = modifiedTime.toISOString();
        var whitespace = (program.minify === true) ? 0 : 4;
        var presetObj = webvsc_1.convertPreset(data, baseName, presetDate, args);
        var presetJson = JSON.stringify(presetObj, null, whitespace);
        if (args.quiet !== true)
            console.log("Writing \"" + outFile + "\"");
        graceful_fs_1.writeFile(outFile, presetJson, function (err) {
            if (err)
                console.error(err);
        });
    });
};
if (program.args !== 'undefined' && program.args.length > 0) {
    program.args.forEach(function (element, index) {
        glob(element, function (error, files) {
            if (error)
                throw error;
            files.forEach(function (file) {
                graceful_fs_1.lstat(file, function (error, stats) {
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