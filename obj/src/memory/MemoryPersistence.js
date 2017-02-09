"use strict";
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
class MemoryPersistence {
    constructor(loader, saver) {
        this._defaultMaxPageSize = 100;
        this._logger = new pip_services_commons_node_1.CompositeLogger();
        this._maxPageSize = this._defaultMaxPageSize;
        this._entities = [];
        this._opened = false;
        this._loader = loader;
        this._saver = saver;
    }
    setReferences(references) {
        this._logger.setReferences(references);
    }
    configure(config) {
        this._maxPageSize = config.getAsIntegerWithDefault("max_page_size", this._maxPageSize);
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
                callback();
            return;
        }
        this._loader.load(correlationId, (err, data) => {
            this._entities = data;
            this._logger.trace(correlationId, "Loaded {0} of {1}", this._entities.length);
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
                callback();
            return;
        }
        var task = this._saver.save(correlationId, this._entities, (err) => {
            this._logger.trace(correlationId, "Saved {0} of {1}", this._entities.length);
            if (callback)
                callback(err);
        });
    }
    getOneById(correlationId, id, callback) {
        var items = this._entities.filter((x) => { return x.id == id; });
        var item = items.length > 0 ? items[0] : null;
        if (item != null)
            this._logger.trace(correlationId, "Retrieved {0} by {1}", item, id);
        else
            this._logger.trace(correlationId, "Cannot find {0} by {1}", id);
        callback(null, item);
    }
    create(correlationId, entity, callback) {
        if (entity == null) {
            if (callback)
                callback(null, null);
            return;
        }
        if (entity.id == null) {
            pip_services_commons_node_2.ObjectWriter.setProperty(entity, "id", pip_services_commons_node_2.IdGenerator.nextLong());
        }
        this._entities.push(entity);
        this._logger.trace(correlationId, "Created {0}", entity);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, entity);
        });
    }
    set(correlationId, entity, callback) {
        if (entity == null) {
            if (callback)
                callback(null, null);
            return;
        }
        if (entity.id == null) {
            pip_services_commons_node_2.ObjectWriter.setProperty(entity, "id", pip_services_commons_node_2.IdGenerator.nextLong());
        }
        var index = this._entities.map((x) => { return x.id; }).indexOf(entity.id);
        if (index < 0)
            this._entities.push(entity);
        else
            this._entities[index] = entity;
        this._logger.trace(correlationId, "Set {0}", entity);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, entity);
        });
    }
    update(correlationId, entity, callback) {
        var index = this._entities.map((x) => { return x.id; }).indexOf(entity.id);
        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = {0} was not found", entity.id);
            callback(null, null);
            return;
        }
        this._entities[index] = entity;
        this._logger.trace(correlationId, "Updated {0}", entity);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, entity);
        });
    }
    deleteById(correlationId, id, callback) {
        var index = this._entities.map((x) => { return x.id; }).indexOf(id);
        var entity = this._entities[index];
        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = {0} was not found", entity.id);
            callback(null, null);
            return;
        }
        this._entities.splice(index, 1);
        this._logger.trace(correlationId, "Deleted {0}", entity);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, entity);
        });
    }
    clear(correlationId, callback) {
        this._entities = [];
        this._logger.trace(correlationId, "Cleared {0}");
        this.save(correlationId, callback);
    }
}
exports.MemoryPersistence = MemoryPersistence;
//# sourceMappingURL=MemoryPersistence.js.map