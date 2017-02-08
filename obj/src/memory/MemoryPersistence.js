"use strict";
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
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
    open(correlation_id) {
        this.load(correlation_id);
        this._opened = true;
    }
    close(correlation_id) {
        this.save(correlation_id);
        this._opened = false;
    }
    load(correlation_id) {
        if (this._loader == null)
            return;
        this._entities = this._loader.load(correlation_id);
        this._logger.trace(correlation_id, "Loaded {0} of {1}", this._entities.length);
    }
    getListByQuery(correlation_id, query, sort) {
        let result;
        this._logger.trace(correlation_id, "Retrieved {0} of {1}", this._entities.length);
        result = this._entities.slice(0);
        return result;
    }
    getOneById(correlationId, id) {
        var items = this._entities.filter((x) => { return x.id == id; });
        var item = items.length > 0 ? items[0] : null;
        if (item != null)
            this._logger.trace(correlationId, "Retrieved {0} by {1}", item, id);
        else
            this._logger.trace(correlationId, "Cannot find {0} by {1}", id);
        return item;
    }
    save(correlation_id) {
        if (this._saver == null)
            return;
        var task = this._saver.save(correlation_id, this._entities);
        this._logger.trace(correlation_id, "Saved {0} of {1}", this._entities.length);
    }
    create(correlation_id, entity) {
        let identifiable;
        if (typeof entity.id == "string" || entity.id == null)
            identifiable = entity;
        if (identifiable != null && entity.id == null)
            pip_services_commons_node_2.ObjectWriter.setProperty(entity, "id", pip_services_commons_node_3.IdGenerator.nextLong());
        this._entities.push(entity);
        this._logger.trace(correlation_id, "Created {0}", entity);
        this.save(correlation_id);
        return entity;
    }
    set(correlation_id, entity) {
        let identifiable;
        if (typeof entity.id == "string" || entity.id == null)
            identifiable = entity;
        if (identifiable != null && entity.id == null)
            pip_services_commons_node_2.ObjectWriter.setProperty(entity, "id", pip_services_commons_node_3.IdGenerator.nextLong());
        var index = this._entities.map((x) => { return x.id; }).indexOf(entity.id);
        if (index < 0)
            this._entities.push(entity);
        else
            this._entities[index] = entity;
        this._logger.trace(correlation_id, "Set {0}", entity);
        this.save(correlation_id);
        return entity;
    }
    update(correlation_id, entity) {
        var index = this._entities.map((x) => { return x.id; }).indexOf(entity.id);
        if (index < 0)
            return null;
        this._entities[index] = entity;
        this._logger.trace(correlation_id, "Updated {0}", entity);
        this.save(correlation_id);
        return entity;
    }
    deleteById(correlation_id, id) {
        var index = this._entities.map((x) => { return x.id; }).indexOf(id);
        var entity = this._entities[index];
        if (index < 0)
            return null;
        this._entities.splice(index, 1);
        this._logger.trace(correlation_id, "Deleted {0}", entity);
        this.save(correlation_id);
        return entity;
    }
    clear(correlation_id) {
        this._entities = [];
        this._logger.trace(correlation_id, "Cleared {0}");
        this.save(correlation_id);
    }
}
exports.MemoryPersistence = MemoryPersistence;
//# sourceMappingURL=MemoryPersistence.js.map