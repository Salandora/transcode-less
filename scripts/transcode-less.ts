import {TextEditor} from "atom";
import Fs = require("fs");
import Path = require("path");

import {DisposableCollection} from "./utils";
import {FileTranscoder, TextEditorTranscoder} from "./transcoder";

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
            observers.add(editor.getPath(), new TextEditorTranscoder(editor));
          }
        })
      );

      // Add keybindings
      observers.add(
        "transcode-less:keybindings",
        (<any>atom.commands).add("atom-workspace", { "transcode-less:render-all": () => {

          var readdir = (path: string) => (error: any, files: string[]) => {
            for (let i = 0; i < files.length; i++) {
              let filepath = Path.join(path, files[i]);
              var stat = Fs.statSync(filepath);
              if (stat.isFile() && Path.extname(filepath) == ".less") {
                let transcoder = new FileTranscoder(filepath);
                transcoder.transcode();
              }
            }
          };

          var paths = atom.project.getPaths();
          for (let i = 0; i < paths.length; i++) {
            var path = paths[i];
            if (!path.startsWith(".")) {

            }
          }
        }}));
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
