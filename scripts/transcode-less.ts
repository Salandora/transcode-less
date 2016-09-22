import Transcoder = require("./transcoder");

import {DetailedError} from "./error";

/**
 * Serialized state
 */
interface State {
}

/** Add observer on TextEditor */
function observe(editor: AtomCore.IEditor) {
  let disposable = editor.onDidSave(event => {
    Transcoder.transcodeFile(editor.getPath())
      .then((filepath: string) => {
        atom.notifications.addSuccess("Rendering success", { detail: filepath })
      })
      .catch((error: DetailedError) => {
        atom.notifications.addError(error.message, { detail: error.detail });
      });
  });
  editor.onDidDestroy(() => { disposable.dispose(); });
}

let globalObserver: AtomCore.Disposable;

/** Called when the package is activated */
export function activate(state: State) {
  // Add global observer
  globalObserver = atom.workspace.observeTextEditors((editor: AtomCore.IEditor) => {
    var grammar = editor.getGrammar();
    if (grammar.packageName == "language-less") {
      observe(editor);
    }
  });

  // Add keybindings
  atom.commands.add("atom-workspace", {
    "transcode-less:trasncode-all": () => {
      Transcoder.transcodeAll()
        .then((filepath: string) => {
          atom.notifications.addSuccess("Rendering success", { detail: filepath })
        })
        .catch((error: DetailedError) => {
          atom.notifications.addError(error.message, { detail: error.detail });
        });
    }
  });
}

/** Called when the package is deactivated */
export function deactivate() {
  globalObserver.dispose();
}

/** Called when the package's state is saved */
export function serialize(): State {
  var state = {
  }
  return state;
}
