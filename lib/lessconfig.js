"use strict";
var Fs = require("fs");
var Path = require("path");
var NpmUtils = require("./npm-utils");
var LessConfig;
(function (LessConfig) {
    function pop(obj, key, otherwise) {
        if (otherwise === void 0) { otherwise = undefined; }
        if (obj.hasOwnProperty(key)) {
            otherwise = obj[key];
            delete obj[key];
        }
        return otherwise;
    }
    function getOptionForLessFile(path) {
        if (Fs.statSync(path).isFile()) {
            path = Path.dirname(path);
        }
        var configPath;
        do {
            configPath = Path.join(path, "lessconfig.json");
            path = Path.dirname(path);
        } while (!Fs.existsSync(configPath) && atom.project.contains(path));
        var options;
        if (Fs.existsSync(configPath)) {
            var rawOptions = JSON.parse(Fs.readFileSync(configPath).toString());
            options = new Options();
            options.rootDir = pop(rawOptions, "rootDir", Path.dirname(configPath));
            options.outDir = pop(rawOptions, "outDir", Path.dirname(configPath));
            // outDir resolution
            if (!Path.isAbsolute(options.outDir)) {
                options.outDir = Path.resolve(Path.dirname(configPath), options.outDir);
            }
            // rootDir resolution
            if (!Path.isAbsolute(options.rootDir)) {
                options.rootDir = Path.resolve(Path.dirname(configPath), options.rootDir);
            }
            if (rawOptions.plugins) {
                options.plugins = rawOptions.plugins;
            }
            rawOptions.plugins = [];
            options.options = rawOptions;
            options.filepath = configPath;
        }
        else {
            options = LessConfig.DefaultOptions;
        }
        if (options.options.paths) {
            var basepath = Path.dirname(path);
            for (var i = 0; i < options.options.paths.length; i++) {
                if (!Path.isAbsolute(options.options.paths[i])) {
                    options.options.paths[i] = Path.resolve(basepath, options.options.paths[i]);
                }
            }
        }
        return options;
    }
    LessConfig.getOptionForLessFile = getOptionForLessFile;
    /**
     * TranscodeLess options
     */
    var Options = (function () {
        function Options() {
            /** Plugin list */
            this.plugins = {};
            /** Less options */
            this.options = {
                plugins: []
            };
        }
        Options.prototype.getFilepath = function () {
            return this.filepath;
        };
        /** Add to `options` loaded plugins and return unloaded */
        Options.prototype.loadPlugins = function (options, plugins) {
            var unavailablePlugins = [];
            for (var index in plugins) {
                var name_1 = plugins[index];
                try {
                    var pluginClass = require(name_1);
                    var plugin = new pluginClass(this.plugins[name_1]);
                    options.plugins.push(plugin);
                }
                catch (error) {
                    console.error(error);
                    unavailablePlugins.push(name_1);
                }
            }
            return unavailablePlugins;
        };
        /**
         * Get options object for less rendering
         */
        Options.prototype.loadOptions = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var options = _this.options;
                var plugins = [];
                for (var plugin in _this.plugins) {
                    plugins.push(plugin);
                }
                var unavailablePlugins = _this.loadPlugins(options, plugins);
                if (unavailablePlugins.length > 0) {
                    atom.notifications.addInfo("Less plugin install", { detail: unavailablePlugins.join(", ") });
                    NpmUtils.install(unavailablePlugins)
                        .then(function () {
                        _this.loadPlugins(options, unavailablePlugins);
                        resolve(options);
                    })
                        .catch(function () {
                        unavailablePlugins = _this.loadPlugins(options, unavailablePlugins);
                        atom.notifications.addWarning(unavailablePlugins.join(", ") + " are not available", { dismissable: true });
                        resolve(options);
                    });
                }
                else {
                    resolve(options);
                }
            });
        };
        return Options;
    }());
    LessConfig.Options = Options;
    LessConfig.DefaultOptions = new LessConfig.Options();
})(LessConfig = exports.LessConfig || (exports.LessConfig = {}));
//# sourceMappingURL=lessconfig.js.map