{CompositeDisposable} = require 'atom'
less = require("less")

module.exports = TranscodeLess =

  # @var CompositeDisposable
  subscriptions: null

  activate: (state) ->
    @subscriptions = new CompositeDisposable()
    observer = atom.workspace.observeTextEditors((editor) => @subscribeTextEditor(editor))
    @subscriptions.add(observer)

  serialize: () ->
    return { }

  deactivate: () ->
    @subscriptions.dispose()
    @subscriptions = null

  subscribeTextEditor: (editor) ->
    grammar = editor.getGrammar()
    if grammar.packageName == 'language-less'
      observer = editor.onDidSave((event) => @onEditorSave(event))
      @subscriptions.add(observer)

  onEditorSave: (event) ->
    editor = atom.workspace.getActiveTextEditor()
    less.render(editor.getText()).then((output) => console.log("render", output))
