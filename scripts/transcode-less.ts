import {TextEditor} from "atom";
import {DisposableCollection} from "./utils";
import {Transcoder} from "./transcoder";

module TranscodeLess {
  /**
   * Serialized state
   */
  interface State {
  }

  /** Disposable holder */
  var observers = new DisposableCollection();

  /**
   * Exported module
   */
  export var Static = {
    /** Called when the package is activated */
    activate: function(state: State) {
      // Add global observer
      observers.add(
        "transcode-less:global",
        (<any>atom.workspace).observeTextEditors((editor: TextEditor) => {
          var grammar = editor.getGrammar();
          if ((<any>grammar).packageName == "language-less") {
            observers.add(editor.getPath(), new Transcoder(editor));
          }
        })
      );
    },

    /** Called when the package is deactivated */
    deactivate: function() {
      observers.dispose();
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
