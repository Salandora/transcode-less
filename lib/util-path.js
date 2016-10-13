"use strict";
var Fs = require("fs");
var Path = require("path");
var UtilPath;
(function (UtilPath) {
    /**
     * Test if a path is contained in atom projects paths
     */
    /*private*/ function containsInAtomProject(path) {
        return atom.project.contains(Path.join(path, Path.sep));
    }
    /**
     * Return the minimal depth for less file starting from the given path
     */
    /*private*/ function getLessFileMinDepth(path) {
        var depth = -1;
        var nextPaths = [path];
        var paths;
        var files;
        var currentPath;
        while (nextPaths.length > 0) {
            depth++;
            paths = nextPaths;
            nextPaths = [];
            while (paths.length > 0) {
                currentPath = paths.pop();
                files = Fs.readdirSync(currentPath);
                for (var f = 0; f < files.length; f++) {
                    if (Path.extname(files[f]) == ".less") {
                        return depth;
                    }
                    else if (Fs.statSync(Path.join(currentPath, files[f]).isDirectory())) {
                        nextPaths.push(Path.join(currentPath, files[f]));
                    }
                }
            }
        }
        return -1;
    }
    /**
     * Test if a file exists
     */
    function exists(path) {
        return new Promise(function (resolve, reject) {
            try {
                resolve(existsSync(path));
            }
            catch (error) {
                reject(error);
            }
        });
    }
    UtilPath.exists = exists;
    /**
     * Synchronous version of *fileExists()*
     */
    function existsSync(path) {
        try {
            Fs.accessSync(path, Fs.F_OK);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    UtilPath.existsSync = existsSync;
    /**
     * Look up in folder hierarchy until `lessconfig.json` is found, or get out of the project directory.
     */
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
    /**
     * Synchronous version of *findConfigFileForPath()*
     */
    function findConfigFileForPathSync(path) {
        var filepath = undefined;
        if (Fs.statSync(path).isFile()) {
            path = Path.dirname(path);
        }
        while (filepath == undefined && containsInAtomProject(path)) {
            if (existsSync(Path.join(path, "lessconfig.json"))) {
                filepath = Path.join(path, "lessconfig.json");
            }
            path = Path.dirname(path);
        }
        return filepath;
    }
    UtilPath.findConfigFileForPathSync = findConfigFileForPathSync;
    /**
     * Return the min depth for less files, from the given path.
     */
    function getMinDepthOfLessFiles(path) {
        var nextPaths = [path];
        var depth = -1;
        var paths, files, currentPath;
        while (nextPaths.length > 0) {
            paths = nextPaths;
            nextPaths = [];
            depth++;
            do {
                currentPath = paths.pop();
                files = Fs.readdirSync(currentPath);
                for (var f = files.length - 1; f >= 0; f--) {
                    if (Fs.statSync(Path.join(currentPath, files[f])).isDirectory()) {
                        nextPaths.push(Path.join(currentPath, files[f]));
                    }
                    else if (Path.extname(files[f]) == ".less") {
                        return depth;
                    }
                }
            } while (paths.length > 0);
        }
        return -1;
    }
    UtilPath.getMinDepthOfLessFiles = getMinDepthOfLessFiles;
    /**
     * Relativize absolute path from project path
     */
    function getRelativeFilePath(filepath) {
        if (!Path.isAbsolute(filepath)) {
            return filepath;
        }
        var relativeFilepath = Path.dirname(filepath);
        while (containsInAtomProject(Path.dirname(relativeFilepath))) {
            relativeFilepath = Path.dirname(relativeFilepath);
        }
        return Path.relative(relativeFilepath, filepath);
    }
    UtilPath.getRelativeFilePath = getRelativeFilePath;
    /**
     * Creates directory recursively
     */
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
    /**
     * Synchronous version of *mkdir()*
     */
    function mkdirSync(path) {
        var paths = [];
        while (!existsSync(path)) {
            paths.push(Path.basename(path));
            path = Path.dirname(path);
        }
        while (paths.length > 0) {
            path = Path.join(path, paths.pop());
            Fs.mkdirSync(path);
        }
    }
    UtilPath.mkdirSync = mkdirSync;
})(UtilPath = exports.UtilPath || (exports.UtilPath = {}));
//# sourceMappingURL=util-path.js.map