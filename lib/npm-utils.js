"use strict";
var Npm = require("npm");
var Fs = require("fs");
var Path = require("path");
var NpmUtils = (function () {
    function NpmUtils() {
        this.packagePath = atom.packages.getLoadedPackage("transcode-less")["path"];
    }
    /** Execute the specified command with the given arguments */
    NpmUtils.prototype.execute = function (command, args, resolve, reject) {
        var _this = this;
        if (args === void 0) { args = undefined; }
        console.debug("execute: " + command, args);
        Npm.load(this.packagePath, function (error) {
            if (error) {
                console.error("Error: npm.load()", error);
            }
            else {
                Npm.prefix = _this.packagePath;
                var cb = function (error) {
                    var data = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        data[_i - 1] = arguments[_i];
                    }
                    if (error) {
                        console.error("Error: npm.commands." + command + "()", error);
                        if (reject) {
                            reject(error);
                        }
                    }
                    else if (resolve) {
                        resolve(data);
                    }
                };
                Npm.commands[command](args, cb);
            }
        });
    };
    /** Install the specified less plugin */
    NpmUtils.prototype.install = function (packageNames) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.execute("install", packageNames, resolve, reject);
        });
    };
    return NpmUtils;
}());
module.exports = new NpmUtils();
//# sourceMappingURL=npm-utils.js.map