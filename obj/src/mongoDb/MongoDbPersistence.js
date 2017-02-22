"use strict";
var async = require('async');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
const pip_services_commons_node_4 = require("pip-services-commons-node");
const pip_services_commons_node_5 = require("pip-services-commons-node");
const pip_services_commons_node_6 = require("pip-services-commons-node");
const pip_services_commons_node_7 = require("pip-services-commons-node");
const pip_services_commons_node_8 = require("pip-services-commons-node");
const pip_services_commons_node_9 = require("pip-services-commons-node");
const mongoose_1 = require("mongoose");
class MongoDbPersistence {
    constructor(collectionName, schema) {
        this._defaultConfig = pip_services_commons_node_2.ConfigParams.fromTuples("connection.type", "mongodb", "connection.database", "test", "connection.host", "localhost", "connection.port", 27017, "options.poll_size", 4, "options.keep_alive", 1, "options.connect_timeout", 5000, "options.auto_reconnect", true, "options.max_page_size", 100, "options.debug", true);
        this._logger = new pip_services_commons_node_1.CompositeLogger();
        this._connectionResolver = new pip_services_commons_node_3.ConnectionResolver();
        this._credentialResolver = new pip_services_commons_node_4.CredentialResolver();
        this._options = new pip_services_commons_node_2.ConfigParams();
        if (collectionName == null)
            throw new Error("collectionName could not be null");
        this._collectionName = collectionName;
        this._connection = mongoose_1.createConnection();
        this._model = this._connection.model(this._collectionName, schema);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }
    configure(config) {
        config = config.setDefaults(this._defaultConfig);
        this._connectionResolver.configure(config, true);
        this._credentialResolver.configure(config, true);
        this._options = this._options.override(config.getSection("options"));
    }
    // Convert object to JSON format
    jsonToPublic(value) {
        if (value && value.toJSON)
            value = value.toJSON();
        return value;
    }
    isOpened() {
        return this._connection.readyState == 1;
    }
    open(correlationId, callback) {
        let connection;
        let credential;
        async.series([
            (callback) => {
                this._connectionResolver.resolve(correlationId, (err, result) => {
                    connection = result;
                    callback(err);
                });
            },
            (callback) => {
                this._credentialResolver.lookup(correlationId, (err, result) => {
                    credential = result;
                    callback(err);
                });
            }
        ], (err) => {
            if (err)
                throw new pip_services_commons_node_5.ConfigException(correlationId, "CONNECTION_ERROR", "Connectionotions is not set properly")
                    .withCause(err);
            if (connection == null)
                throw new pip_services_commons_node_5.ConfigException(correlationId, "NO_CONNECTION", "Database connection is not set");
            var host = connection.getHost();
            if (host == null)
                throw new pip_services_commons_node_5.ConfigException(correlationId, "NO_HOST", "Connection host is not set");
            var port = connection.getPort();
            if (port == 0)
                throw new pip_services_commons_node_5.ConfigException(correlationId, "NO_PORT", "Connection port is not set");
            var databaseName = connection.getAsNullableString("database");
            if (databaseName == null)
                throw new pip_services_commons_node_5.ConfigException(correlationId, "NO_DATABASE", "Connection database is not set");
            var pollSize = this._options.getAsNullableInteger("poll_size");
            var keepAlive = this._options.getAsNullableInteger("keep_alive");
            var connectTimeoutMS = this._options.getAsNullableInteger("connect_timeout");
            var auto_reconnect = this._options.getAsNullableBoolean("auto_reconnect");
            var max_page_size = this._options.getAsNullableInteger("max_page_size");
            var debug = this._options.getAsNullableBoolean("debug");
            this._logger.trace(correlationId, "Connecting to mongodb database {0}, collection {1}", databaseName, this._collectionName);
            let uri = "mongodb://" + host + (port == null ? "" : ":" + port) + "/" + databaseName;
            let settings;
            try {
                settings = {
                    server: {
                        poolSize: pollSize,
                        socketOptions: {
                            keepAlive: keepAlive,
                            connectTimeoutMS: connectTimeoutMS
                        },
                        auto_reconnect: auto_reconnect,
                        max_page_size: max_page_size,
                        debug: debug
                    }
                };
                if (credential && credential.getUsername()) {
                    settings.user = credential.getUsername();
                    settings.pass = credential.getPassword();
                }
                this._connection.open(uri, settings, callback);
                this._logger.debug(correlationId, "Connected to mongodb database {0}, collection {1}", databaseName, this._collectionName);
            }
            catch (ex) {
                throw new pip_services_commons_node_6.ConnectionException(correlationId, "ConnectFailed", "Connection to mongodb failed")
                    .withCause(ex);
            }
        });
    }
    close(correlationId, callback) {
        this._connection.close((err) => {
            if (err) {
                err = new pip_services_commons_node_6.ConnectionException(correlationId, 'DisconnectFailed', 'Disconnect from mongodb failed: ')
                    .withCause(err);
            }
            else {
                this._logger.trace(correlationId, "Disconnected from {0} successfully", this._collectionName);
            }
            ;
            callback(err);
        });
    }
    getOneById(correlationId, id, callback) {
        this._model.findById(id, (err, data) => {
            if (!err)
                this._logger.trace(correlationId, "Retrieved from {0} with id = {1}", this._collectionName, id);
            if (callback) {
                data = this.jsonToPublic(data);
                callback(err, data);
            }
        });
    }
    create(correlationId, entity, callback) {
        if (entity == null) {
            if (callback)
                callback(null, null);
            return;
        }
        if (entity.id == null) {
            pip_services_commons_node_8.ObjectWriter.setProperty(entity, "id", pip_services_commons_node_9.IdGenerator.nextLong());
        }
        entity._id = entity.id;
        this._model.create(entity, (err, data) => {
            if (!err)
                this._logger.trace(correlationId, "Created in {0} with id = {1}", this._collectionName, data.id);
            if (callback) {
                data = this.jsonToPublic(data);
                callback(err, data);
            }
        });
    }
    set(correlationId, entity, callback) {
        if (entity == null) {
            if (callback)
                callback(null, null);
            return;
        }
        if (entity.id == null) {
            pip_services_commons_node_8.ObjectWriter.setProperty(entity, "id", pip_services_commons_node_9.IdGenerator.nextLong());
        }
        entity._id = entity.id;
        var filter = {
            id: entity.id
        };
        var options = {
            new: true,
            upsert: true
        };
        this._model.findOneAndUpdate(filter, entity, options, (err, data) => {
            if (!err)
                this._logger.trace(correlationId, "Set in {0} with id = {1}", this._collectionName, entity.id);
            if (callback) {
                data = this.jsonToPublic(data);
                callback(err, data);
            }
        });
    }
    update(correlationId, entity, callback) {
        if (entity == null || entity.id == null) {
            if (callback)
                callback(null, null);
            return;
        }
        var options = {
            new: true
        };
        this._model.findByIdAndUpdate(entity.id, entity, options, (err, data) => {
            if (!err)
                this._logger.trace(correlationId, "Update in {0} with id = {1}", this._collectionName, entity.id);
            if (callback) {
                data = this.jsonToPublic(data);
                callback(err, data);
            }
        });
    }
    deleteById(correlationId, id, callback) {
        this._model.findByIdAndRemove(id, (err, data) => {
            if (!err)
                this._logger.trace(correlationId, "Deleted from {0} with id = {1}", this._collectionName, id);
            if (callback) {
                data = this.jsonToPublic(data);
                callback(err, data);
            }
        });
    }
    clear(correlationId, callback) {
        this._connection.db.dropCollection(this._collectionName, (err) => {
            if (err && err.message != "ns not found")
                err = new pip_services_commons_node_7.BadRequestException(correlationId, "DropCollectionFailed", "Connection to mongodb failed")
                    .withCause(err);
            else if (err && err.message == "ns not found")
                err = null;
            if (callback)
                callback(err);
        });
    }
}
exports.MongoDbPersistence = MongoDbPersistence;
//# sourceMappingURL=MongoDbPersistence.js.map