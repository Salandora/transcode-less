import {Disposable} from "event-kit";
import Fs = require("fs");
import Less = require("less");
import Path = require("path");

import {LessConfig} from "./lessconfig";

export class Transcoder extends Disposable implements AtomCore.Disposable {

  private options: LessConfig.Options;
  private editor: AtomCore.IEditor;
  private editorSaveObserver: AtomCore.Disposable;

  constructor(editor: AtomCore.IEditor) {
    super(() => this.editorSaveObserver.dispose());
    this.editor = editor;
    this.editorSaveObserver = this.editor.onDidSave(this.transcode.bind(this));
  }

  public transcode() {
    this.options = LessConfig.Options.getOptionForFile(this.editor.getPath());

    Fs.readFile(this.editor.getPath(), null, (error: NodeJS.ErrnoException, data: string) => {
      console.log("[transcode] TODO: handle error => ", error)
      this.render(data);
    });
  }

  private render(input: string) {
    var options: any = this.options.getLessOptions();
    options.paths = [ Path.dirname(this.editor.getPath()) ];
    Less.render(input.toString(), <Less.Options>options)
      .then(this.onCuccess.bind(this))
      .catch(this.onError.bind(this));
  }

  private onCuccess(output: Less.RenderOutput) {
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

    Fs.writeFile(outFile, output.css, (error: NodeJS.ErrnoException) => console.log("[onCuccess] TODO: handle error => ", error));
  }

  private onError(reason: any) {
    console.log("[onError] TODO: handle error => ", reason);
  }
}
