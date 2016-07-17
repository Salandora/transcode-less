"use strict";
var Fs = require("fs");
var Path = require("path");
var LessConfig;
(function (LessConfig) {
    /**
     * TranscodeLess options
     *
     * plugins: An object keyed by plugin's name, associated to a list arguments
     *          with is passed to the plugin class' constructor
     */
    var Options = (function () {
        function Options() {
            /** Plugin list */
            this.plugins = {};
        }
        Options.getOptionForFile = function (path) {
            if (Fs.statSync(path).isFile()) {
                path = Path.dirname(path);
            }
            var configPath;
            do {
                configPath = Path.join(path, "lessconfig.json");
                path = Path.dirname(path);
            } while (!Fs.existsSync(configPath) && atom.project.contains(path));
            if (Fs.existsSync(configPath)) {
                var rawOptions = require(configPath);
                var options = new Options();
                for (var prop in rawOptions) {
                    options[prop] = rawOptions[prop];
                }
                options.filepath = configPath;
                return options;
            }
            return LessConfig.DefaultOptions;
        };
        Options.prototype.getFilepath = function () {
            return this.filepath;
        };
        /**
         * Get options object for less rendering
         */
        Options.prototype.getLessOptions = function () {
            var options = {
                plugins: []
            };
            for (var pluginName in this.plugins) {
                var pluginClass = require(pluginName);
                var plugin = new pluginClass(this.plugins[pluginName]);
                options.plugins.push(plugin);
            }
            return options;
        };
        return Options;
    }());
    LessConfig.Options = Options;
    LessConfig.DefaultOptions = new LessConfig.Options();
})(LessConfig = exports.LessConfig || (exports.LessConfig = {}));
//# sourceMappingURL=lessconfig.js.map