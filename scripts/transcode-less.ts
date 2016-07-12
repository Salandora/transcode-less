import {CompositeDisposable} from "event-kit";
import less = require("less");

import DisposableCollection = require("./utils");

module TranscodeLess {
  /**
   * Serialized state
   */
  interface State {
  }

  /**
   * Package context a whole workspace
   */
  class Context extends DisposableCollection {

    constructor() {
      super();
      this.add("_global", atom.workspace.observeTextEditors(this.onTextEditorOpen.bind(this)));
    }

    private onTextEditorOpen(editor: AtomCore.IEditor) {
      var grammar = editor.getGrammar();
      if (grammar.packageName == "language-less") {
        this.add(editor.getPath(), editor.onDidSave(this.onLessFileSaved.bind(this)));
        console.log(this);
      }
    }

    private onLessFileSaved(event: { path: string }) {

    }
  }

  /**
   * Exported module
   */
  export var Static = {
    /** Called when the package is activated */
    activate: function(state: State) {
      console.log("transcode-less:activate", state);
      this.context = new Context();
    },
    /** Called when the package is deactivated */
    deactivate: function() {
      this.context.dispose();
    },
    /** Called when the package's state is saved */
    serialize: function(): State {
      var state = {
      }
      return state;
    }
  }
}


export = TranscodeLess.Static;
