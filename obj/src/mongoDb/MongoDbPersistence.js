"use strict";
var pip_services_commons_node_1 = require("pip-services-commons-node");
var pip_services_commons_node_2 = require("pip-services-commons-node");
var pip_services_commons_node_3 = require("pip-services-commons-node");
var MongoDbPersistence = (function () {
    function MongoDbPersistence(loader, saver) {
        this._defaultMaxPageSize = 100;
        this._logger = new pip_services_commons_node_1.CompositeLogger();
        this._maxPageSize = this._defaultMaxPageSize;
        this._entities = [];
        this._opened = false;
        this._loader = loader;
        this._saver = saver;
    }
    MongoDbPersistence.prototype.setReferences = function (references) {
        this._logger.setReferences(references);
    };
    MongoDbPersistence.prototype.configure = function (config) {
        this._maxPageSize = config.getAsIntegerWithDefault("max_page_size", this._maxPageSize);
    };
    MongoDbPersistence.prototype.isOpened = function () {
        return this._opened;
    };
    MongoDbPersistence.prototype.open = function (correlation_id) {
        this.load(correlation_id);
        this._opened = true;
    };
    MongoDbPersistence.prototype.close = function (correlation_id) {
        this.save(correlation_id);
        this._opened = false;
    };
    MongoDbPersistence.prototype.load = function (correlation_id) {
        if (this._loader == null)
            return;
        this._entities = this._loader.load(correlation_id);
        this._logger.trace(correlation_id, "Loaded {0} of {1}", this._entities.length);
    };
    MongoDbPersistence.prototype.getOneById = function (correlationId, id) {
        var items = this._entities.filter(function (x) { return x.id == id; });
        var item = items.length > 0 ? items[0] : null;
        if (item != null)
            this._logger.trace(correlationId, "Retrieved {0} by {1}", item, id);
        else
            this._logger.trace(correlationId, "Cannot find {0} by {1}", id);
        return item;
    };
    MongoDbPersistence.prototype.save = function (correlation_id) {
        if (this._saver == null)
            return;
        var task = this._saver.save(correlation_id, this._entities);
        this._logger.trace(correlation_id, "Saved {0} of {1}", this._entities.length);
    };
    MongoDbPersistence.prototype.create = function (correlation_id, entity) {
        var identifiable;
        if (typeof entity.id == "string" || entity.id == null)
            identifiable = entity;
        if (identifiable != null && entity.id == null)
            pip_services_commons_node_2.ObjectWriter.setProperty(entity, "id", pip_services_commons_node_3.IdGenerator.nextLong());
        this._entities.push(entity);
        this._logger.trace(correlation_id, "Created {0}", entity);
        this.save(correlation_id);
        return entity;
    };
    MongoDbPersistence.prototype.set = function (correlation_id, entity) {
        var identifiable;
        if (typeof entity.id == "string" || entity.id == null)
            identifiable = entity;
        if (identifiable != null && entity.id == null)
            pip_services_commons_node_2.ObjectWriter.setProperty(entity, "id", pip_services_commons_node_3.IdGenerator.nextLong());
        var index = this._entities.map(function (x) { return x.id; }).indexOf(entity.id);
        if (index < 0)
            this._entities.push(entity);
        else
            this._entities[index] = entity;
        this._logger.trace(correlation_id, "Set {0}", entity);
        this.save(correlation_id);
        return entity;
    };
    MongoDbPersistence.prototype.update = function (correlation_id, entity) {
        var index = this._entities.map(function (x) { return x.id; }).indexOf(entity.id);
        if (index < 0)
            return null;
        this._entities[index] = entity;
        this._logger.trace(correlation_id, "Updated {0}", entity);
        this.save(correlation_id);
        return entity;
    };
    MongoDbPersistence.prototype.deleteById = function (correlation_id, id) {
        var index = this._entities.map(function (x) { return x.id; }).indexOf(id);
        var entity = this._entities[index];
        if (index < 0)
            return null;
        this._entities.splice(index, 1);
        this._logger.trace(correlation_id, "Deleted {0}", entity);
        this.save(correlation_id);
        return entity;
    };
    MongoDbPersistence.prototype.clear = function (correlation_id) {
        this._entities = [];
        this._logger.trace(correlation_id, "Cleared {0}");
        this.save(correlation_id);
    };
    return MongoDbPersistence;
}());
exports.MongoDbPersistence = MongoDbPersistence;
//# sourceMappingURL=MongoDbPersistence.js.map