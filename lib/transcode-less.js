"use strict";
var Transcoder = require("./transcoder");
/**
 * Add observer on TextEditor
 */
function observe(editor) {
    var disposable = editor.onDidSave(function (event) {
        Transcoder.transcodeFile(editor.getPath())
            .then(function (filepath) {
            atom.notifications.addSuccess("Rendering success", { detail: filepath });
        })
            .catch(function (error) {
            atom.notifications.addError(error.message, { detail: error.detail });
            console.error(error);
        });
    });
    editor.onDidDestroy(function () { disposable.dispose(); });
}
var globalObserver;
/**
 * Called when the package is activated
 */
function activate(state) {
    // Add global observer
    globalObserver = atom.workspace.observeTextEditors(function (editor) {
        var grammar = editor.getGrammar();
        if (grammar.packageName == "language-less") {
            observe(editor);
        }
    });
    // Add keybindings
    atom.commands.add("atom-workspace", {
        "transcode-less:trasncode-all": function () {
            Transcoder.transcodeAll()
                .then(function (filepath) {
                atom.notifications.addSuccess("Rendering success", { detail: filepath });
            })
                .catch(function (error) {
                atom.notifications.addError(error.message, { detail: error.detail });
                console.error(error);
            });
        }
    });
}
exports.activate = activate;
/**
 * Called when the package is deactivated
 */
function deactivate() {
    globalObserver.dispose();
}
exports.deactivate = deactivate;
/**
  * Called when the package's state is saved
  */
function serialize() {
    var state = {};
    return state;
}
exports.serialize = serialize;
//# sourceMappingURL=transcode-less.js.map