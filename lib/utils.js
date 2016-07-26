"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var atom_1 = require("atom");
/**
 * Keyed dispoable collection
 */
var DisposableCollection = (function (_super) {
    __extends(DisposableCollection, _super);
    function DisposableCollection() {
        var _this = this;
        _super.call(this, function () { return _this.clear(); });
        this.disposables = {};
    }
    /**
     * Add a disposable to this collection
     *
     * If the key already exists, dispose and delete the previous disposable
     */
    DisposableCollection.prototype.add = function (key, disposable) {
        this.del(key);
        this.disposables[key] = disposable;
    };
    /**
     * Remove a disposable from this collection
     */
    DisposableCollection.prototype.del = function (key) {
        if (this.disposables[key]) {
            this.disposables[key].dispose();
            delete this.disposables[key];
        }
    };
    /**
     * Dispose every disposables in this collection and delete them
     */
    DisposableCollection.prototype.clear = function () {
        for (var key in this.disposables) {
            this.disposables[key].dispose();
            delete this.disposables[key];
        }
    };
    return DisposableCollection;
}(atom_1.Disposable));
exports.DisposableCollection = DisposableCollection;
//# sourceMappingURL=utils.js.map