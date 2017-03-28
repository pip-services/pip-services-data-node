"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
class MemoryPersistence {
    constructor(loader, saver) {
        this._logger = new pip_services_commons_node_1.CompositeLogger();
        this._items = [];
        this._opened = false;
        this._loader = loader;
        this._saver = saver;
    }
    setReferences(references) {
        this._logger.setReferences(references);
    }
    isOpened() {
        return this._opened;
    }
    open(correlationId, callback) {
        this.load(correlationId, (err) => {
            this._opened = true;
            if (callback)
                callback(err);
        });
    }
    load(correlationId, callback) {
        if (this._loader == null) {
            if (callback)
                callback(null);
            return;
        }
        this._loader.load(correlationId, (err, items) => {
            if (err == null) {
                this._items = items;
                this._logger.trace(correlationId, "Loaded %d items", this._items.length);
            }
            if (callback)
                callback(err);
        });
    }
    close(correlationId, callback) {
        this.save(correlationId, (err) => {
            this._opened = false;
            if (callback)
                callback(err);
        });
    }
    save(correlationId, callback) {
        if (this._saver == null) {
            if (callback)
                callback(null);
            return;
        }
        let task = this._saver.save(correlationId, this._items, (err) => {
            if (err == null)
                this._logger.trace(correlationId, "Saved %d items", this._items.length);
            if (callback)
                callback(err);
        });
    }
    clear(correlationId, callback) {
        this._items = [];
        this._logger.trace(correlationId, "Cleared items");
        this.save(correlationId, callback);
    }
}
exports.MemoryPersistence = MemoryPersistence;
//# sourceMappingURL=MemoryPersistence.js.map