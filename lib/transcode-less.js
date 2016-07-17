"use strict";
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
                    observers.add(editor.getPath(), new transcoder_1.Transcoder(editor));
                }
            }));
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