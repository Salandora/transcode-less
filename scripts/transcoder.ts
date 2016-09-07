import {Disposable, TextEditor} from "atom";
import Fs = require("fs");
import Less = require("less");
import Path = require("path");
import Utils = require("./utils");

import {LessConfig} from "./lessconfig";

/**  */
export class Transcoder  {
  constructor() {
  }

  /**
   * Render the given input string using less render method
   */
  protected render(input: string, options: Less.Options): Promise<Less.RenderOutput> {
    return Less.render(input.toString(), <Less.Options>options);
  }
}

/** Transcoder for file */
export class FileTranscoder extends Transcoder {

    private filepath: string;
    private relativeFilepath: string;

    constructor(filepath: string) {
      super();
      this.filepath = filepath;
      // Fancy path for notifications
      let relativeFilepath = Path.dirname(filepath);
      while (atom.project.contains(Path.dirname(relativeFilepath))) {
        relativeFilepath = Path.dirname(relativeFilepath);
      }
      this.relativeFilepath = Path.relative(relativeFilepath, filepath);
    }

    /**
     * Reads asynchronously the file and call render
     */
    public transcode() {
      let configuration = LessConfig.Options.getOptionFromFile(this.filepath);

      Fs.readFile(this.filepath, null, (error: NodeJS.ErrnoException, data: string) => {
        if (error) {
          console.error("FileTranscoder.transcode(): " + error.name, error);
          atom.notifications.addError(this.relativeFilepath, { detail: error.message });
        }
        else {
          atom.notifications.addInfo(this.relativeFilepath, { detail: "Start rendering" });
          configuration.loadOptions()
            .then((options: Less.Options) => {
              (<any>options).paths = (<any>options).paths || [ Path.dirname(this.filepath) ];
              this.render(data.toString(), options)
                .then(this.onSuccess.bind(this, configuration))
                .catch(this.onError.bind(this, configuration));
            });
        }
      });
    }

    /**
     * Write the transcoded content into the apropriate output file
     */
    protected onSuccess(options: LessConfig.Options, output: Less.RenderOutput) {
      var outDir = Path.dirname(this.filepath);
      if (options.outDir) {
        outDir = options.outDir;
      }
      if (!this.mkdir(outDir)) {
        atom.notifications.addError(outDir, { detail: "Out directory cannot be create" });
      }

      var filename = Path.basename(this.filepath).replace(".less", ".css");
      var outFile = Path.join(outDir, filename);

      Fs.writeFile(outFile, output.css, (error: NodeJS.ErrnoException) => {
        if (error) {
          console.error("FileTranscoder.onSuccess(): " + error.name, error);
          atom.notifications.addError(this.relativeFilepath, { detail: error.message });
        }
        else {
          atom.notifications.addSuccess(this.relativeFilepath, { detail: "Rendering success" });
        }
      });
    }

    /** Make directories recurcively */
    private mkdir(path: string): boolean {
      let dirnameStack: string[] = [];
      let tempDir = path;
      while (!Fs.existsSync(tempDir) && atom.project.contains(Path.dirname(tempDir))) {
        dirnameStack.push(Path.basename(tempDir));
        tempDir = Path.dirname(tempDir);
      }
      if (!atom.project.contains(tempDir)) {
        return false;
      }
      for (let i in dirnameStack) {
        tempDir = Path.join(tempDir, dirnameStack[i]);
        Fs.mkdirSync(tempDir);
      }

      return true;
    }

    /**
     * Handle error when less rendering
     */
    protected onError(options: LessConfig.Options, reason: any) {
      atom.notifications.addError(this.relativeFilepath, { detail: reason.toString(), dismissable: true });
    }
}

/** Transcoder for Atom TextEditor */
export class TextEditorTranscoder extends FileTranscoder implements Disposable {

  private editorSaveObserver: Disposable;

  constructor(editor: TextEditor) {
    super(editor.getPath());
      this.editorSaveObserver = editor.onDidSave(this.transcode.bind(this));
  }

  public dispose() {
    this.editorSaveObserver.dispose();
    this.editorSaveObserver = undefined;
  }
}
