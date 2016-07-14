import {Disposable} from "event-kit";
import fs = require("fs");
import less = require("less");
import path = require("path");

import {LessConfig} from "./lessconfig";

export class Transcoder extends Disposable implements AtomCore.Disposable {

  private editor: AtomCore.IEditor;
  private editorSaveObserver: AtomCore.Disposable;

  constructor(editor: AtomCore.IEditor) {
    super(() => { console.log(this.editor.getPath(), "transcoder disposed"); this.editorSaveObserver.dispose(); });
    this.editor = editor;
    this.editorSaveObserver = this.editor.onDidSave(this.transcode.bind(this));
  }

  private render(input: string) {
    var options: any = {};
    options.plugins = [];
    //options.paths = [ path.dirname(this.editor.getPath()) ];
    less.render(input.toString(), <Less.Options>options)
      .then((output: Less.RenderOutput) => console.log("success", output))
      .catch((reason: any) => console.log("error", reason));
  }

  private onRendered(error: Less.RenderError, output: Less.RenderOutput) {
    console.log("error", error);
    console.log("output", output);
  }

  public transcode() {
    var options = new LessConfig.Options();

    fs.readFile(this.editor.getPath(), null, (err: NodeJS.ErrnoException, data: string) => {
      this.render(data);
    });
  }
}
