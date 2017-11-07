'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var program = require("commander");
var process_1 = require("process");
var fs_1 = require("fs");
var glob = require("glob");
var path_1 = require("path");
// Modules
var convert_1 = require("@visbot/webvsc/lib/convert");
var args = {
    verbose: 0,
    quiet: false
};
program
    .version(require('../package.json').version)
    .usage('[options] <file(s)>')
    .option('-v, --verbose <int>', 'print more information, can be set multiple times to increase output', parseInt)
    .option('-m, --minify', 'minify generated JSON')
    .option('-q, --quiet', 'print errors only')
    .option('-n, --no-hidden', 'don\'t extract hidden strings from fixed-size strings')
    .parse(process_1.argv);
var convert = function (file, customArgs) {
    Object.assign(args, customArgs);
    fs_1.readFile(file, function (error, data) {
        if (args.quiet !== true)
            console.log("\nReading \"" + file + "\"");
        // File Meta
        var extName = path_1.extname(file);
        var baseName = path_1.basename(file, extName);
        var dirName = path_1.dirname(file);
        var outFile = path_1.join(dirName, baseName + '.webvs');
        var modifiedTime = fs_1.statSync(file).mtime;
        var preset = {
            'name': baseName,
            'date': modifiedTime.toISOString()
        };
        args['preset'] = preset;
        console.log(args);
        var whitespace = (program.minify === true) ? 0 : 4;
        var presetObj = convert_1.convertPreset(data, args);
        var presetJson = JSON.stringify(presetObj, null, whitespace);
        if (args.quiet !== true)
            console.log("Writing \"" + outFile + "\"");
        fs_1.writeFile(outFile, presetJson, function (err) {
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
                fs_1.lstat(file, function (error, stats) {
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