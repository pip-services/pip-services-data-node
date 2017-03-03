"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const MemoryPersistence_1 = require("./MemoryPersistence");
class IdentifiableMemoryPersistence extends MemoryPersistence_1.MemoryPersistence {
    constructor(loader, saver) {
        super(loader, saver);
        this._defaultMaxPageSize = 100;
        this._maxPageSize = this._defaultMaxPageSize;
    }
    configure(config) {
        this._maxPageSize = config.getAsIntegerWithDefault("max_page_size", this._maxPageSize);
    }
    getOneById(correlationId, id, callback) {
        let items = this._items.filter((x) => { return x.id == id; });
        let item = items.length > 0 ? items[0] : null;
        if (item != null)
            this._logger.trace(correlationId, "Retrieved %s by %s", item, id);
        else
            this._logger.trace(correlationId, "Cannot find item by %s", id);
        callback(null, item);
    }
    create(correlationId, item, callback) {
        if (item == null) {
            if (callback)
                callback(null, null);
            return;
        }
        if (item.id == null) {
            pip_services_commons_node_1.ObjectWriter.setProperty(item, "id", pip_services_commons_node_2.IdGenerator.nextLong());
        }
        this._items.push(item);
        this._logger.trace(correlationId, "Created %s", item);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, item);
        });
    }
    set(correlationId, item, callback) {
        if (item == null) {
            if (callback)
                callback(null, null);
            return;
        }
        if (item.id == null) {
            pip_services_commons_node_1.ObjectWriter.setProperty(item, "id", pip_services_commons_node_2.IdGenerator.nextLong());
        }
        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);
        if (index < 0)
            this._items.push(item);
        else
            this._items[index] = item;
        this._logger.trace(correlationId, "Set %s", item);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, item);
        });
    }
    update(correlationId, item, callback) {
        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);
        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = %s was not found", item.id);
            callback(null, null);
            return;
        }
        this._items[index] = item;
        this._logger.trace(correlationId, "Updated %s", item);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, item);
        });
    }
    deleteById(correlationId, id, callback) {
        var index = this._items.map((x) => { return x.id; }).indexOf(id);
        var item = this._items[index];
        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = %s was not found", item.id);
            callback(null, null);
            return;
        }
        this._items.splice(index, 1);
        this._logger.trace(correlationId, "Deleted %s", item);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, item);
        });
    }
    clear(correlationId, callback) {
        this._items = [];
        this._logger.trace(correlationId, "Cleared %s");
        this.save(correlationId, callback);
    }
}
exports.IdentifiableMemoryPersistence = IdentifiableMemoryPersistence;
//# sourceMappingURL=IdentifiableMemoryPersistence.js.map