/**
 * State normalization for serialization
 */
interface TranscodeLessState {
  version: string
}

/**
 * Observes events on less editor
 */
class EditorObserver extends AtomCore.Disposable {

  constructor(editor: AtomCore.IEditor) {
    super(() => this.onDispose());
  }

  public dispose():void {
    super.dispose();
  }

  private onDispose() {

  }
}

var obervableHolder = new class {

  /** Global observer */
  globalObserver: AtomCore.Disposable = undefined;

  /** Less editor oberver list */
  editorOberverList: EditorObserver[] = [];

  public setGlobalObserver(observer: AtomCore.Disposable) {
    this.globalObserver = observer;
  }

  public addEditorObserver(observer: EditorObserver) {
    this.editorOberverList.push(observer);
  }

  public dispose() {
    if (this.globalObserver) {
      this.globalObserver.dispose();
    }

    this.editorOberverList.forEach((disposable) => disposable.dispose());
  }
}

export default {
  /**
   * Called when the package is activated
   */
  activate(state: TranscodeLessState): void {
    console.error("TranscodeLess::activate()");

    atom.commands.add("atom-workspace", "transcode-less:reload", () => {
      console.log("transcode-less:reload");
      var serialized = this.serialize();
      this.desactivate();
      this.activate(serialized);
    })

    var textEditorsObserver = atom.workspace.observeTextEditors((editor: AtomCore.IEditor) => {
      console.log(editor.getGrammar().name);
    });
    obervableHolder.setGlobalObserver(textEditorsObserver);
  },

  /**
   * Called when the window is shutting down
   */
  desactivate() {
    obervableHolder.dispose();
  },

  /**
   * Return the JSON state of the package when the window is shutting down
   */
  serialize(): TranscodeLessState {
    return {
      version: "0.0.1"
    };
  }
}
