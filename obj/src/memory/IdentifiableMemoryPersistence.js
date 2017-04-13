"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
const pip_services_commons_node_4 = require("pip-services-commons-node");
const MemoryPersistence_1 = require("./MemoryPersistence");
class IdentifiableMemoryPersistence extends MemoryPersistence_1.MemoryPersistence {
    constructor(loader, saver) {
        super(loader, saver);
        this._maxPageSize = 100;
    }
    configure(config) {
        this._maxPageSize = config.getAsIntegerWithDefault("options.max_page_size", this._maxPageSize);
    }
    getPageByFilter(correlationId, filter, paging, sort, select, callback) {
        let items = this._items;
        // Filter and sort
        if (_.isFunction(filter))
            items = _.filter(items, filter);
        if (_.isFunction(sort))
            items = _.sortUniqBy(items, sort);
        // Extract a page
        paging = paging != null ? paging : new pip_services_commons_node_1.PagingParams();
        let skip = paging.getSkip(-1);
        let take = paging.getTake(this._maxPageSize);
        let total = null;
        if (paging.total)
            total = items.length;
        if (skip > 0)
            items = _.slice(items, skip);
        items = _.take(items, take);
        this._logger.trace(correlationId, "Retrieved %d items", items.length);
        let page = new pip_services_commons_node_2.DataPage(items, total);
        callback(null, page);
    }
    getListByFilter(correlationId, filter, sort, select, callback) {
        let items = this._items;
        // Apply filter
        if (_.isFunction(filter))
            items = _.filter(items, filter);
        // Apply sorting
        if (_.isFunction(sort))
            items = _.sortUniqBy(items, sort);
        this._logger.trace(correlationId, "Retrieved %d items", items.length);
        callback(null, items);
    }
    getListByIds(correlationId, ids, callback) {
        let filter = (item) => {
            return _.indexOf(ids, item.id) >= 0;
        };
        this.getListByFilter(correlationId, filter, null, null, callback);
    }
    getOneRandom(correlationId, filter, callback) {
        let items = this._items;
        // Apply filter
        if (_.isFunction(filter))
            items = _.filter(items, filter);
        let item = items.length > 0 ? _.sample(items) : null;
        if (item != null)
            this._logger.trace(correlationId, "Retrieved a random item");
        else
            this._logger.trace(correlationId, "Nothing to return as random item");
        callback(null, item);
    }
    getOneById(correlationId, id, callback) {
        let items = this._items.filter((x) => { return x.id == id; });
        let item = items.length > 0 ? items[0] : null;
        if (item != null)
            this._logger.trace(correlationId, "Retrieved item %s", id);
        else
            this._logger.trace(correlationId, "Cannot find item by %s", id);
        callback(null, item);
    }
    create(correlationId, item, callback) {
        item = _.clone(item);
        if (item.id == null)
            pip_services_commons_node_3.ObjectWriter.setProperty(item, "id", pip_services_commons_node_4.IdGenerator.nextLong());
        this._items.push(item);
        this._logger.trace(correlationId, "Created item %s", item.id);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, item);
        });
    }
    set(correlationId, item, callback) {
        item = _.clone(item);
        if (item.id == null)
            pip_services_commons_node_3.ObjectWriter.setProperty(item, "id", pip_services_commons_node_4.IdGenerator.nextLong());
        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);
        if (index < 0)
            this._items.push(item);
        else
            this._items[index] = item;
        this._logger.trace(correlationId, "Set item %s", item.id);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, item);
        });
    }
    update(correlationId, item, callback) {
        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);
        if (index < 0) {
            this._logger.trace(correlationId, "Item %s was not found", item.id);
            callback(null, null);
            return;
        }
        item = _.clone(item);
        this._items[index] = item;
        this._logger.trace(correlationId, "Updated item %s", item.id);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, item);
        });
    }
    updatePartially(correlationId, id, data, callback) {
        let index = this._items.map((x) => { return x.id; }).indexOf(id);
        if (index < 0) {
            this._logger.trace(correlationId, "Item %s was not found", id);
            callback(null, null);
            return;
        }
        let item = this._items[index];
        item = _.extend(item, data.getAsObject());
        this._items[index] = item;
        this._logger.trace(correlationId, "Partially updated item %s", id);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, item);
        });
    }
    deleteById(correlationId, id, callback) {
        var index = this._items.map((x) => { return x.id; }).indexOf(id);
        var item = this._items[index];
        if (index < 0) {
            this._logger.trace(correlationId, "Item %s was not found", id);
            callback(null, null);
            return;
        }
        this._items.splice(index, 1);
        this._logger.trace(correlationId, "Deleted item by %s", id);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err, item);
        });
    }
    deleteByFilter(correlationId, filter, callback) {
        let deleted = 0;
        for (let index = this._items.length - 1; index >= 0; index--) {
            let item = this._items[index];
            if (filter(item)) {
                this._items.splice(index, 1);
                deleted++;
            }
        }
        if (deleted == 0) {
            callback(null);
            return;
        }
        this._logger.trace(correlationId, "Deleted %s items", deleted);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err);
        });
    }
    deleteByIds(correlationId, ids, callback) {
        let filter = (item) => {
            return _.indexOf(ids, item.id) >= 0;
        };
        this.deleteByFilter(correlationId, filter, callback);
    }
}
exports.IdentifiableMemoryPersistence = IdentifiableMemoryPersistence;
//# sourceMappingURL=IdentifiableMemoryPersistence.js.map