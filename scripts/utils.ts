import {Disposable, Notification} from "atom";

/**
 * Keyed dispoable collection
 */
export class DisposableCollection extends Disposable implements Disposable {

  private disposables: { [key: string]: Disposable };

  constructor() {
    super(() => this.clear());
    this.disposables = {};
  }

  /**
   * Add a disposable to this collection
   *
   * If the key already exists, dispose and delete the previous disposable
   */
  public add(key: string, disposable: Disposable) {
    this.del(key);
    this.disposables[key] = disposable;
  }

  /**
   * Remove a disposable from this collection
   */
  public del(key: string) {
    if (this.disposables[key]) {
      this.disposables[key].dispose();
      delete this.disposables[key];
    }
  }

  /**
   * Dispose every disposables in this collection and delete them
   */
  public clear() {
    for (var key in this.disposables) {
      this.disposables[key].dispose();
      delete this.disposables[key];
    }
  }
}

/** Utilitary class for self dismissable notification */
export var notifications = new class {
  private notify(type: string, message: string, options?: { detail?: string; dismissable?: boolean; }, delay?: number) {
    let notification: Notification = new (<any>Notification)(type, message, options);
    (<any>atom.notifications).addNotification(notification);

    if (delay && delay > 0) {
      setTimeout(notification.dismiss.bind(notification), delay * 1000);
    }
  }

  /** Add an error notification */
  public addError(message: string, options?: { detail?: string; dismissable?: boolean; }, delay?: number) {
    this.notify("error", message, options, delay);
  }

  /** Add an info notification */
  public addInfo(message: string, options?: { detail?: string; dismissable?: boolean; }, delay?: number) {
    this.notify("info", message, options, delay);
  }

  /** Add a success notification */
  public addSuccess(message: string, options?: { detail?: string; dismissable?: boolean; }, delay?: number) {
    this.notify("success", message, options, delay);
  }
};
