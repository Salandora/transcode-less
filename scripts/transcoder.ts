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
          console.error("Error: Transcoder.transcode()", error);
        }
        else {
          Utils.notifications.addInfo(this.relativeFilepath, { detail: "Start rendering", dismissable: true }, 2);
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
      console.log("options", options);
      Utils.notifications.addSuccess(this.relativeFilepath, { detail: "Rendering success", dismissable: true }, 2);
      var outDir = Path.dirname(this.filepath);
      if (options.outDir) {
        outDir = options.outDir;
      }
      var filename = Path.basename(this.filepath).replace(".less", ".css");
      var outFile = Path.join(outDir, filename);

      Fs.writeFile(outFile, output.css, (error: NodeJS.ErrnoException) => { if (error) console.error("Error Transcoder.onCuccess()/writeFile()", error); });
    }

    /**
     * Handle error when less rendering
     */
    protected onError(options: LessConfig.Options, reason: any) {
      Utils.notifications.addError(this.relativeFilepath, { detail: reason.toString(), dismissable: true });
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
