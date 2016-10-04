"use strict";
var Fs = require("fs");
var Path = require("path");
var UtilPath;
(function (UtilPath) {
    /** Creates directory recursively */
    function mkdir(path) {
        return new Promise(function (resolve, reject) {
            try {
                mkdirSync(path);
                resolve();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    UtilPath.mkdir = mkdir;
    /** Synchronous version of *mkdir()* */
    function mkdirSync(path) {
        var paths = [];
        var stop = false;
        while (!stop) {
            try {
                Fs.accessSync(path, Fs.F_OK);
                stop = true;
            }
            catch (error) {
                paths.push(Path.basename(path));
                path = Path.dirname(path);
            }
        }
        while (paths.length > 0) {
            path = Path.join(path, paths.pop());
            Fs.mkdirSync(path);
        }
    }
    UtilPath.mkdirSync = mkdirSync;
    /** Look up in folder hierarchy until `lessconfig.json` is found, or get out of the project directory. */
    function findConfigFileForPath(path) {
        return new Promise(function (resolve, reject) {
            try {
                resolve(findConfigFileForPathSync(path));
            }
            catch (error) {
                reject(error);
            }
        });
    }
    UtilPath.findConfigFileForPath = findConfigFileForPath;
    /** Synchronous version of *findConfigFileForPath()* */
    function findConfigFileForPathSync(path) {
        var filepath = undefined;
        if (Fs.statSync(path).isFile()) {
            path = Path.dirname(path);
        }
        while (filepath == undefined && atom.project.contains(path)) {
            try {
                Fs.accessSync(Path.join(path, "lessconfig.json"), Fs.F_OK);
                filepath = Path.join(path, "lessconfig.json");
            }
            catch (error) {
                path = Path.dirname(path);
            }
        }
        if (filepath == undefined && atom.project.getPaths().indexOf(path) > -1) {
            try {
                Fs.accessSync(Path.join(path, "lessconfig.json"), Fs.F_OK);
                filepath = Path.join(path, "lessconfig.json");
            }
            catch (error) {
            }
        }
        return filepath;
    }
    UtilPath.findConfigFileForPathSync = findConfigFileForPathSync;
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
    UtilPath.getRelativeFilePath = getRelativeFilePath;
})(UtilPath = exports.UtilPath || (exports.UtilPath = {}));
//# sourceMappingURL=util-path.js.map