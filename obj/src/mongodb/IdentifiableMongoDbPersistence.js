"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
const pip_services_commons_node_4 = require("pip-services-commons-node");
const MongoDbPersistence_1 = require("./MongoDbPersistence");
class IdentifiableMongoDbPersistence extends MongoDbPersistence_1.MongoDbPersistence {
    constructor(collection, schema) {
        super(collection, schema);
        this._maxPageSize = 100;
        if (collection == null)
            throw new Error("Collection name could not be null");
        if (schema == null)
            throw new Error("Schema could not be null");
    }
    configure(config) {
        super.configure(config);
        this._maxPageSize = config.getAsIntegerWithDefault("options.max_page_size", this._maxPageSize);
    }
    getPageByFilter(correlationId, filter, paging, sort, select, callback) {
        // Adjust max item count based on configuration
        paging = paging || new pip_services_commons_node_1.PagingParams();
        let skip = paging.getSkip(-1);
        let take = paging.getTake(this._maxPageSize);
        let pagingEnabled = paging.total;
        // Configure statement
        let statement = this._model.find(filter);
        if (skip >= 0)
            statement.skip(skip);
        statement.limit(take);
        if (sort && !_.isEmpty(sort))
            statement.sort(sort);
        if (select && !_.isEmpty(select))
            statement.select(select);
        statement.exec((err, items) => {
            if (err) {
                callback(err, null);
                return;
            }
            items = _.map(items, this.convertToPublic);
            if (pagingEnabled) {
                this._model.count(filter, (err, count) => {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    let page = new pip_services_commons_node_2.DataPage(items, count);
                    callback(null, page);
                });
            }
            else {
                let page = new pip_services_commons_node_2.DataPage(items);
                callback(null, page);
            }
        });
    }
    getListByFilter(correlationId, filter, sort, select, callback) {
        // Configure statement
        let statement = this._model.find(filter);
        if (sort && !_.isEmpty(sort))
            statement.sort(sort);
        if (select && !_.isEmpty(select))
            statement.select(select);
        statement.exec((err, items) => {
            if (err) {
                callback(err, null);
                return;
            }
            items = _.map(items, this.convertToPublic);
            callback(null, items);
        });
    }
    getOneById(correlationId, id, callback) {
        this._model.findById(id, (err, item) => {
            if (!err)
                this._logger.trace(correlationId, "Retrieved from %s with id = %s", this._collection, id);
            item = this.convertToPublic(item);
            callback(err, item);
        });
    }
    getOneRandom(correlationId, filter, callback) {
        this._model.count(filter, (err, count) => {
            if (err) {
                callback(err, null);
                return;
            }
            let pos = _.random(0, count - 1);
            this._model.find(filter)
                .skip(pos)
                .limit(1)
                .exec((err, items) => {
                let item = (items != null && items.length > 0) ? items[0] : null;
                item = this.convertToPublic(item);
                callback(err, item);
            });
        });
    }
    create(correlationId, item, callback) {
        if (item == null) {
            callback(null, null);
            return;
        }
        // Assign unique id
        item._id = item.id || pip_services_commons_node_4.IdGenerator.nextLong();
        // Remove id field
        delete item.id;
        this._model.create(item, (err, newItem) => {
            if (!err)
                this._logger.trace(correlationId, "Created in %s with id = %s", this._collection, newItem.id);
            newItem = this.convertToPublic(newItem);
            callback(err, newItem);
        });
    }
    set(correlationId, item, callback) {
        if (item == null) {
            if (callback)
                callback(null, null);
            return;
        }
        if (item.id == null)
            pip_services_commons_node_3.ObjectWriter.setProperty(item, "id", pip_services_commons_node_4.IdGenerator.nextLong());
        item._id = item.id;
        let filter = {
            id: item.id
        };
        let options = {
            new: true,
            upsert: true
        };
        this._model.findOneAndUpdate(filter, item, options, (err, newItem) => {
            if (!err)
                this._logger.trace(correlationId, "Set in %s with id = %s", this._collection, item.id);
            if (callback) {
                newItem = this.convertToPublic(newItem);
                callback(err, newItem);
            }
        });
    }
    update(correlationId, item, callback) {
        if (item == null || item.id == null) {
            if (callback)
                callback(null, null);
            return;
        }
        var options = {
            new: true
        };
        this._model.findByIdAndUpdate(item.id, item, options, (err, newItem) => {
            if (!err)
                this._logger.trace(correlationId, "Update in %s with id = %s", this._collection, item.id);
            if (callback) {
                newItem = this.convertToPublic(newItem);
                callback(err, newItem);
            }
        });
    }
    deleteById(correlationId, id, callback) {
        this._model.findByIdAndRemove(id, (err, oldItem) => {
            if (!err)
                this._logger.trace(correlationId, "Deleted from %s with id = %s", this._collection, id);
            if (callback) {
                oldItem = this.convertToPublic(oldItem);
                callback(err, oldItem);
            }
        });
    }
}
exports.IdentifiableMongoDbPersistence = IdentifiableMongoDbPersistence;
//# sourceMappingURL=IdentifiableMongoDbPersistence.js.map