module TranscodeLess {
  /**
   * Keyed dispoable collection
   */
  export class DisposableCollection implements AtomEventKit.IDisposable {

    private disposables: { [key: string]: AtomCore.Disposable };

    constructor() {
      this.disposables = {};
    }

    /**
     * Add a disposable to this collection
     *
     * If the key already exists, dispose and delete the previous disposable
     */
    public add(key: string, disposable: AtomCore.Disposable) {
      if (this.disposables[key]) {
        this.disposables[key].dispose();
        delete this.disposables[key];
      }
      this.disposables[key] = disposable;
    }

    /**
     * Dispose every disposables in this collection and delete them
     */
    public dispose() {
      for (var key in this.disposables) {
        this.disposables[key].dispose();
        delete this.disposables[key];
      }
    }
  }
}

export = TranscodeLess.DisposableCollection;
