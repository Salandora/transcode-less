{CompositeDisposable} = require 'atom'
less = require("less")

module.export = TranscodeLess =

  # @var CompositeDisposable
  subscriptions: null

  activate: (state) ->
    @subscriptions = new CompositeDisposable
    observer = atom.workspace.observeTextEditors (editor) => @subscribeTextEditor(editor)
    @subscriptions.add observer

  deactivate: () ->
    @subscriptions.dispose()
    @subscriptions = null


  subscribeTextEditor: (editor) ->
    grammar = editor.getGrammar()
    if grammar.name.toLowerCase() == 'less'
      observer = editor.onDidSave
