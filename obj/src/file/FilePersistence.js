"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var JsonFilePersister_1 = require("./JsonFilePersister");
var MemoryPersistence_1 = require("../memory/MemoryPersistence");
var FilePersistence = (function (_super) {
    __extends(FilePersistence, _super);
    function FilePersistence(persister) {
        var _this = this;
        if (persister == null)
            persister = new JsonFilePersister_1.JsonFilePersister();
        _this = _super.call(this, persister, persister) || this;
        _this._persister = persister;
        return _this;
    }
    FilePersistence.prototype.configure = function (config) {
        _super.prototype.configure.call(this, config);
        this._persister.configure(config);
    };
    return FilePersistence;
}(MemoryPersistence_1.MemoryPersistence));
exports.FilePersistence = FilePersistence;
//# sourceMappingURL=FilePersistence.js.map