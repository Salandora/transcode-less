"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Fs = require("fs");
var Less = require("less");
var Path = require("path");
var lessconfig_1 = require("./lessconfig");
/**  */
var Transcoder = (function () {
    function Transcoder() {
    }
    /**
     * Render the given input string using less render method
     */
    Transcoder.prototype.render = function (input, options) {
        return Less.render(input.toString(), options);
    };
    return Transcoder;
}());
exports.Transcoder = Transcoder;
/** Transcoder for file */
var FileTranscoder = (function (_super) {
    __extends(FileTranscoder, _super);
    function FileTranscoder(filepath) {
        _super.call(this);
        this.filepath = filepath;
        // Fancy path for notifications
        var relativeFilepath = Path.dirname(filepath);
        while (atom.project.contains(Path.dirname(relativeFilepath))) {
            relativeFilepath = Path.dirname(relativeFilepath);
        }
        this.relativeFilepath = Path.relative(relativeFilepath, filepath);
    }
    /**
     * Reads asynchronously the file and call render
     */
    FileTranscoder.prototype.transcode = function () {
        var _this = this;
        var configuration = lessconfig_1.LessConfig.Options.getOptionFromFile(this.filepath);
        Fs.readFile(this.filepath, null, function (error, data) {
            if (error) {
                console.error("Error: Transcoder.transcode()", error);
            }
            else {
                atom.notifications.addInfo(_this.relativeFilepath, { detail: "Start rendering" });
                configuration.loadOptions()
                    .then(function (options) {
                    options.paths = options.paths || [Path.dirname(_this.filepath)];
                    _this.render(data.toString(), options)
                        .then(_this.onSuccess.bind(_this, configuration))
                        .catch(_this.onError.bind(_this, configuration));
                });
            }
        });
    };
    /**
     * Write the transcoded content into the apropriate output file
     */
    FileTranscoder.prototype.onSuccess = function (options, output) {
        atom.notifications.addSuccess(this.relativeFilepath, { detail: "Rendering success" });
        var outDir = Path.dirname(this.filepath);
        if (options.outDir) {
            outDir = options.outDir;
        }
        var filename = Path.basename(this.filepath).replace(".less", ".css");
        var outFile = Path.join(outDir, filename);
        Fs.writeFile(outFile, output.css, function (error) { if (error)
            console.error("Error Transcoder.onCuccess()/writeFile()", error); });
    };
    /**
     * Handle error when less rendering
     */
    FileTranscoder.prototype.onError = function (options, reason) {
        atom.notifications.addError(this.relativeFilepath, { detail: reason.toString(), dismissable: true });
    };
    return FileTranscoder;
}(Transcoder));
exports.FileTranscoder = FileTranscoder;
/** Transcoder for Atom TextEditor */
var TextEditorTranscoder = (function (_super) {
    __extends(TextEditorTranscoder, _super);
    function TextEditorTranscoder(editor) {
        _super.call(this, editor.getPath());
        this.editorSaveObserver = editor.onDidSave(this.transcode.bind(this));
    }
    TextEditorTranscoder.prototype.dispose = function () {
        this.editorSaveObserver.dispose();
        this.editorSaveObserver = undefined;
    };
    return TextEditorTranscoder;
}(FileTranscoder));
exports.TextEditorTranscoder = TextEditorTranscoder;
//# sourceMappingURL=transcoder.js.map