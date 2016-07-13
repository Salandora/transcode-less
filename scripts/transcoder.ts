import {LessConfig} from "./lessconfig";

export class Transcoder extends AtomCore.Disposable {

  private editor: AtomCore.IEditor;
  private editorSaveObserver: AtomCore.Disposable;

  constructor(editor: AtomCore.IEditor, options: LessConfig.Options) {
    super(() => {});
    this.editor = editor;
    this.editorSaveObserver = this.editor.onDidSave(this.transcode.bind(this));
  }

  public transcode() {
    var options = new LessConfig.Options();
  }

  public dispose() {
    super.dispose();

    this.editorSaveObserver.dispose();
  }
}
