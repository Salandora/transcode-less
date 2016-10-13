"use strict";
var Fs = require("fs");
var Less = require("less");
var Path = require("path");
var lessconfig_1 = require("./lessconfig");
var util_path_1 = require("./util-path");
/**
 * Render less from the given css string
 */
function render(filepath, input, configuration) {
    return new Promise(function (resolve, reject) {
        configuration.loadOptions()
            .then(function (options) {
            options.paths = options.paths || [Path.dirname(filepath)];
            Less.render(input, options)
                .then(resolve)
                .catch(reject);
        });
    });
}
/**
 * Transcode less file into css file
 */
function transcodeFile(filepath, configuration) {
    if (configuration === void 0) { configuration = undefined; }
    return new Promise(function (resolve, reject) {
        if (configuration == undefined) {
            var configFile = util_path_1.UtilPath.findConfigFileForPathSync(filepath);
            configuration = lessconfig_1.LessConfig.getOptionForLessFile(configFile);
        }
        if (!configuration.options["path"]) {
            configuration.options["path"] = [Path.dirname(filepath)];
        }
        var outBasefile = Path.relative(configuration.rootDir, filepath);
        outBasefile = Path.resolve(configuration.outDir, outBasefile);
        var cssFile = outBasefile.replace(/\.less$/, ".css");
        var mapFile = outBasefile.replace(/\.less$/, ".css.map");
        try {
            util_path_1.UtilPath.mkdirSync(Path.dirname(outBasefile));
            // Read less file content
            Fs.readFile(filepath, function (error, data) {
                if (error) {
                    // Reject with DetailError
                    reject({
                        name: "TL:READFL",
                        message: error.message,
                        detail: "cannot read file: " + util_path_1.UtilPath.getRelativeFilePath(filepath),
                        stack: error.stack
                    });
                }
                else {
                    // Call less.render()
                    render(filepath, data.toString(), configuration)
                        .then(function (output) {
                        if (output.css.length > 0) {
                            // Write css to file
                            Fs.writeFileSync(cssFile, output.css);
                            if (configuration.options.sourceMap) {
                                Fs.writeFileSync(mapFile, output.map);
                            }
                            resolve(Path.relative(Path.dirname(filepath), cssFile));
                        }
                    })
                        .catch(function (error) {
                        // Reject with DetailError
                        reject({
                            name: "TL:PARSE",
                            message: error.message,
                            detail: "less rendering failed: " + util_path_1.UtilPath.getRelativeFilePath(filepath),
                            stack: error.filename + ":" + error.line + " " + error.type
                        });
                    });
                }
            });
        }
        catch (error) {
            reject({
                name: "TL:MKDIR",
                message: "Out directory cannot be create",
                detail: "directory: " + util_path_1.UtilPath.getRelativeFilePath(filepath),
                stack: "transcoder.ts:71"
            });
        }
    });
}
exports.transcodeFile = transcodeFile;
/**
 * Transcode all less files in the project
 */
function transcodeAll(configuration) {
    if (configuration === void 0) { configuration = undefined; }
    return new Promise(function (resolve, reject) {
        var paths = atom.project.getPaths();
        var path;
        var files = [];
        var filepath;
        var stat;
        // looks for lessconfig.json
        do {
            path = paths.pop();
            Fs.readdirSync(path).forEach(function (file) {
                filepath = Path.join(path, file);
                stat = Fs.statSync(filepath);
                if (stat.isDirectory()) {
                    paths.push(filepath);
                }
                else if (stat.isFile() && Path.basename(filepath) == "lessconfig.json") {
                    files.push(filepath);
                }
            });
        } while (paths.length > 0);
        // looks for *.less files from directories containing a lessconfig.json
        paths = files.map(function (file) { return Path.dirname(file); });
        files = [];
        do {
            path = paths.pop();
            Fs.readdirSync(path).forEach(function (file) {
                filepath = Path.join(path, file);
                stat = Fs.statSync(filepath);
                if (stat.isDirectory()) {
                    paths.push(filepath);
                }
                else if (stat.isFile() && Path.extname(filepath) == ".less") {
                    files.push(filepath);
                }
            });
        } while (paths.length > 0);
        if (files.length > 0) {
            // The first file is transcoded alone, in case of plugin should be installed
            transcodeFile(files.pop(), configuration)
                .then(function (filepath) {
                resolve(filepath);
                files.forEach(function (file) {
                    transcodeFile(file, configuration).then(resolve).catch(reject);
                });
            });
        }
    });
}
exports.transcodeAll = transcodeAll;
//# sourceMappingURL=transcoder.js.map