"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var async = require('async');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const MongoDbPersistence_1 = require("./MongoDbPersistence");
class IdentifiableMongoDbPersistence extends MongoDbPersistence_1.MongoDbPersistence {
    constructor(collectionName, schema) {
        super(collectionName, schema);
    }
    getOneById(correlationId, id, callback) {
        this._model.findById(id, (err, item) => {
            if (!err)
                this._logger.trace(correlationId, "Retrieved from %s with id = %s", this._collectionName, id);
            item = this.jsonToPublic(item);
            callback(err, item);
        });
    }
    create(correlationId, item, callback) {
        if (item == null) {
            callback(null, null);
            return;
        }
        if (item.id == null)
            pip_services_commons_node_1.ObjectWriter.setProperty(item, "id", pip_services_commons_node_2.IdGenerator.nextLong());
        item._id = item.id;
        this._model.create(item, (err, newItem) => {
            if (!err)
                this._logger.trace(correlationId, "Created in %s with id = %s", this._collectionName, newItem.id);
            newItem = this.jsonToPublic(newItem);
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
            pip_services_commons_node_1.ObjectWriter.setProperty(item, "id", pip_services_commons_node_2.IdGenerator.nextLong());
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
                this._logger.trace(correlationId, "Set in %s with id = %s", this._collectionName, item.id);
            if (callback) {
                newItem = this.jsonToPublic(newItem);
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
                this._logger.trace(correlationId, "Update in %s with id = %s", this._collectionName, item.id);
            if (callback) {
                newItem = this.jsonToPublic(newItem);
                callback(err, newItem);
            }
        });
    }
    deleteById(correlationId, id, callback) {
        this._model.findByIdAndRemove(id, (err, oldItem) => {
            if (!err)
                this._logger.trace(correlationId, "Deleted from %s with id = %s", this._collectionName, id);
            if (callback) {
                oldItem = this.jsonToPublic(oldItem);
                callback(err, oldItem);
            }
        });
    }
}
exports.IdentifiableMongoDbPersistence = IdentifiableMongoDbPersistence;
//# sourceMappingURL=IdentifiableMongoDbPersistence.js.map