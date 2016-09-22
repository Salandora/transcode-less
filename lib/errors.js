"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Error with an extra detail message
 */
var DetailedError = (function (_super) {
    __extends(DetailedError, _super);
    function DetailedError(message, detail) {
        _super.call(this, message);
        this.detail = detail;
    }
    return DetailedError;
}(Error));
exports.DetailedError = DetailedError;
//# sourceMappingURL=errors.js.map