"use strict";
var Fs = require("fs");
var Less = require("less");
var Path = require("path");
var lessconfig_1 = require("./lessconfig");
/** Create `dirpath` recursively */
function mkdir(dirpath) {
    var parts = [];
    var path = dirpath;
    while (atom.project.contains(Path.dirname(path))) {
        parts.push(Path.basename(path));
        path = Path.dirname(path);
    }
    parts.forEach(function (part) {
        path = Path.join(path, part);
        try {
            Fs.accessSync(path, Fs.F_OK);
        }
        catch (exception) {
            Fs.mkdirSync(path);
        }
    });
    try {
        return Fs.statSync(path).isDirectory();
    }
    catch (exception) {
        return false;
    }
}
/** Relativize absolute path from project path */
function getRelativeFilePath(filepath) {
    if (!Path.isAbsolute(filepath)) {
        return filepath;
    }
    var relativeFilepath = Path.dirname(filepath);
    while (atom.project.contains(Path.dirname(relativeFilepath))) {
        relativeFilepath = Path.dirname(relativeFilepath);
    }
    return Path.relative(relativeFilepath, filepath);
}
/** Render less from the given css string */
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
/** Transcode less file into css file */
function transcodeFile(filepath, configuration) {
    if (configuration === void 0) { configuration = undefined; }
    return new Promise(function (resolve, reject) {
        if (configuration == undefined) {
            configuration = lessconfig_1.LessConfig.Options.getOptionForLessFile(filepath);
        }
        var outDir = Path.dirname(filepath);
        if (configuration.outDir) {
            outDir = Path.resolve(Path.dirname(configuration.getFilepath()), configuration.outDir);
        }
        var cssFile = Path.join(outDir, Path.basename(filepath).replace(/\.less$/, ".css"));
        var mapFile = Path.join(outDir, Path.basename(filepath).replace(/\.less$/, ".css.map"));
        if (!mkdir(outDir)) {
            reject({
                name: "TL:MKDIR",
                message: "Out directory cannot be create",
                detail: "directory: " + getRelativeFilePath(filepath),
                stack: "transcoder.ts:71"
            });
        }
        else {
            // Read less file content
            Fs.readFile(filepath, function (error, data) {
                if (error) {
                    // Reject with DetailError
                    reject({
                        name: "TL:READFL",
                        message: error.message,
                        detail: "cannot read file: " + getRelativeFilePath(filepath),
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
                            detail: "less rendering failed: " + getRelativeFilePath(filepath),
                            stack: error.filename + ":" + error.line + " " + error.type
                        });
                    });
                }
            });
        }
    });
}
exports.transcodeFile = transcodeFile;
/** Transcode all less files in the project */
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
        console.log("files ", files);
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