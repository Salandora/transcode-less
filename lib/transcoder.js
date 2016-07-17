"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var event_kit_1 = require("event-kit");
var Fs = require("fs");
var Less = require("less");
var Path = require("path");
var lessconfig_1 = require("./lessconfig");
var Transcoder = (function (_super) {
    __extends(Transcoder, _super);
    function Transcoder(editor) {
        var _this = this;
        _super.call(this, function () { return _this.editorSaveObserver.dispose(); });
        this.editor = editor;
        this.editorSaveObserver = this.editor.onDidSave(this.transcode.bind(this));
    }
    Transcoder.prototype.transcode = function () {
        var _this = this;
        this.options = lessconfig_1.LessConfig.Options.getOptionForFile(this.editor.getPath());
        Fs.readFile(this.editor.getPath(), null, function (error, data) {
            console.log("[transcode] TODO: handle error => ", error);
            _this.render(data);
        });
    };
    Transcoder.prototype.render = function (input) {
        var options = this.options.getLessOptions();
        options.paths = [Path.dirname(this.editor.getPath())];
        Less.render(input.toString(), options)
            .then(this.onCuccess.bind(this))
            .catch(this.onError.bind(this));
    };
    Transcoder.prototype.onCuccess = function (output) {
        var outDir = this.options.outDir;
        var filename = Path.basename(this.editor.getPath()).replace(".less", ".css");
        if (outDir) {
            if (!Path.isAbsolute(outDir) && this.options.getFilepath()) {
                outDir = Path.resolve(Path.dirname(this.options.getFilepath()), outDir);
            }
        }
        else {
            outDir = Path.dirname(this.editor.getPath());
        }
        var outFile = Path.join(outDir, filename);
        Fs.writeFile(outFile, output.css, function (error) { return console.log("[onCuccess] TODO: handle error => ", error); });
    };
    Transcoder.prototype.onError = function (reason) {
        console.log("[onError] TODO: handle error => ", reason);
    };
    return Transcoder;
}(event_kit_1.Disposable));
exports.Transcoder = Transcoder;
//# sourceMappingURL=transcoder.js.map