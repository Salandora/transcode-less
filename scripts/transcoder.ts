import {Disposable, TextEditor} from "atom";
import Fs = require("fs");
import Less = require("less");
import Path = require("path");

import {LessConfig} from "./lessconfig";

export class Transcoder extends Disposable implements Disposable {

  private options: LessConfig.Options;
  private editor: TextEditor;
  private editorSaveObserver: Disposable;
  private editorRelativePath: string;

  constructor(editor: TextEditor) {
    super(() => this.editorSaveObserver.dispose());
    this.editor = editor;
    this.editorSaveObserver = this.editor.onDidSave(this.transcode.bind(this));

    // Fancy path for notifications
    this.editorRelativePath = editor.getPath();
    do {
      this.editorRelativePath = Path.dirname(this.editorRelativePath);
    } while (atom.project.contains(Path.dirname(this.editorRelativePath)));
    this.editorRelativePath = Path.relative(this.editorRelativePath, editor.getPath());
  }

  /**
   * Reads asynchronously the file and call render
   */
  public transcode() {
    this.options = LessConfig.Options.getOptionForFile(this.editor.getPath());

    Fs.readFile(this.editor.getPath(), null, (error: NodeJS.ErrnoException, data: string) => {
      if (error) {
        console.error("Error: Transcoder.transcode()", error);
      }
      else {
        this.render(data);
      }
    });
  }

  /**
   * Render the given input string using less render method
   */
  private render(input: string) {
    atom.notifications.addInfo(this.editorRelativePath, { detail: "Start rendering", dismissable: true });
    this.options.loadOptions()
      .then((options: any) => {
        options.paths = [ Path.dirname(this.editor.getPath()) ];
        Less.render(input.toString(), <Less.Options>options)
          .then(this.onCuccess.bind(this))
          .catch(this.onError.bind(this));
      });
  }

  /**
   * Write the transcoded content into the apropriate output file
   */
  private onCuccess(output: Less.RenderOutput) {
    atom.notifications.addInfo(this.editorRelativePath, { detail: "Rendering success", dismissable: true });
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

    Fs.writeFile(outFile, output.css, (error: NodeJS.ErrnoException) => { if (error) console.error("Error Transcoder.onCuccess()/writeFile()", error); });
  }

  /**
   * Handle error when less rendering
   */
  private onError(reason: any) {
    atom.notifications.addError(this.editorRelativePath, { detail: "Rendering failed", dismissable: true });
  }
}
