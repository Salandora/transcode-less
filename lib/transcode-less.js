'use babel';

import TranscodeLessView from './transcode-less-view';
import { CompositeDisposable } from 'atom';

export default {

  transcodeLessView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.transcodeLessView = new TranscodeLessView(state.transcodeLessViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.transcodeLessView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'transcode-less:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.transcodeLessView.destroy();
  },

  serialize() {
    return {
      transcodeLessViewState: this.transcodeLessView.serialize()
    };
  },

  toggle() {
    console.log('TranscodeLess was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
