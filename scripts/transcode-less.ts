import {CompositeDisposable} from "event-kit";
import fs = require("fs");
import less = require("less");
import path = require("path");

import {DisposableCollection} from "./utils";

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

    /**
     * Add an observer on less opened file
     */
    private onTextEditorOpen(editor: AtomCore.IEditor) {
      var grammar = editor.getGrammar();
      if (grammar.packageName == "language-less") {
        var dir = path.dirname(editor.getPath());
        // looking for the lessconfig.json file up to the project root directory
        while (atom.project.contains(dir) && !fs.existsSync(path.join(dir, "lessconfig.json"))) {
          dir = path.dirname(dir);
        }

        this.add(editor.getPath(), editor.onDidSave(this.onLessFileSaved.bind(this)));
      }
    }

    /**
     * Listener for less text editor
     */
    private onLessFileSaved(event: { path: string }) {
      var editor = atom.workspace.getActiveTextEditor();
      // shouldn't be necessary
      if (editor.getPath() != event.path) {
        return;
      }

      var dir = path.dirname(event.path);
      var options: Less.Options = {
        filename: editor.getTitle(),
        plugins: []
      };
      options["paths"] = [ dir ];

      less.render(editor.getText(), options).then(
        this.onLessRenderSuccess.bind(this),
        this.onLessRenderError.bind(this));
    }

    /**
     * Callback for less render success
     */
    private onLessRenderSuccess(output: Less.RenderOutput) {
      console.log("onLessRenderSuccess", output);
    }

      /**
       * Callback for less render fail
       */
    private onLessRenderError(error: Less.RenderError) {
      console.log("onLessRenderError", error);
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
