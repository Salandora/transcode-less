"use strict";
var Fs = require("fs");
var Path = require("path");
var utils_1 = require("./utils");
var transcoder_1 = require("./transcoder");
var TranscodeLess;
(function (TranscodeLess) {
    /** Disposable holder */
    var observers = new utils_1.DisposableCollection();
    /**
     * Exported module
     */
    TranscodeLess.Static = {
        /** Called when the package is activated */
        activate: function (state) {
            // Add global observer
            observers.add("transcode-less:global", atom.workspace.observeTextEditors(function (editor) {
                var grammar = editor.getGrammar();
                if (grammar.packageName == "language-less") {
                    observers.add(editor.getPath(), new transcoder_1.TextEditorTranscoder(editor));
                }
            }));
            // Add keybindings
            observers.add("transcode-less:keybindings", atom.commands.add("atom-workspace", { "transcode-less:render-all": function () {
                    var readdir = function (path) { return function (error, files) {
                        for (var i = 0; i < files.length; i++) {
                            var filepath = Path.join(path, files[i]);
                            var stat = Fs.statSync(filepath);
                            if (stat.isFile() && Path.extname(filepath) == ".less") {
                                var transcoder = new transcoder_1.FileTranscoder(filepath);
                                transcoder.transcode();
                            }
                        }
                    }; };
                    var paths = atom.project.getPaths();
                    for (var i = 0; i < paths.length; i++) {
                        var path = paths[i];
                        if (!path.startsWith(".")) {
                        }
                    }
                } }));
        },
        /** Called when the package is deactivated */
        deactivate: function () {
            observers.dispose();
        },
        /** Called when the package's state is saved */
        serialize: function () {
            var state = {};
            return state;
        }
    };
})(TranscodeLess || (TranscodeLess = {}));
module.exports = TranscodeLess.Static;
//# sourceMappingURL=transcode-less.js.map