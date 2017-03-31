"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let async = require('async');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
const pip_services_commons_node_4 = require("pip-services-commons-node");
const pip_services_commons_node_5 = require("pip-services-commons-node");
const pip_services_commons_node_6 = require("pip-services-commons-node");
const mongoose_1 = require("mongoose");
class MongoDbPersistence {
    constructor(collection, schema) {
        this._defaultConfig = pip_services_commons_node_2.ConfigParams.fromTuples("collection", null, "connection.type", "mongodb", "connection.database", "test", "connection.host", "localhost", "connection.port", 27017, "options.poll_size", 2, "options.keep_alive", 1, "options.connect_timeout", 5000, "options.auto_reconnect", true, "options.max_page_size", 100, "options.debug", true);
        this._logger = new pip_services_commons_node_1.CompositeLogger();
        this._connectionResolver = new pip_services_commons_node_3.ConnectionResolver();
        this._credentialResolver = new pip_services_commons_node_4.CredentialResolver();
        this._options = new pip_services_commons_node_2.ConfigParams();
        this._connection = mongoose_1.createConnection();
        this._collection = collection;
        this._schema = schema;
        if (collection != null && schema != null) {
            schema.set('collection', collection);
            this._model = this._connection.model(collection, schema);
        }
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
        let collection = config.getAsStringWithDefault('collection', this._collection);
        if (collection != this._collection && this._schema != null) {
            this._collection = collection;
            this._schema.set('collection', collection);
            this._model = this._model = this._connection.model(collection, this._schema);
        }
        this._options = this._options.override(config.getSection("options"));
    }
    // Convert object to JSON format
    convertToPublic(value) {
        if (value && value.toJSON)
            value = value.toJSON();
        return value;
    }
    isOpened() {
        return this._connection.readyState == 1;
    }
    open(correlationId, callback) {
        let connections;
        let credential;
        async.series([
            (callback) => {
                this._connectionResolver.resolveAll(correlationId, (err, result) => {
                    connections = result;
                    callback(err);
                });
            },
            (callback) => {
                this._credentialResolver.lookup(correlationId, (err, result) => {
                    credential = result;
                    callback(err);
                });
            },
            (callback) => {
                if (connections == null && connections.length == 0) {
                    let err = new pip_services_commons_node_5.ConfigException(correlationId, "NO_CONNECTION", "Database connection is not set");
                    callback(err);
                    return;
                }
                let hosts = '';
                let uri = null;
                this._database = '';
                for (let index = 0; index < connections.length; index++) {
                    let connection = connections[index];
                    uri = connection.getUri();
                    if (uri != null)
                        break;
                    let host = connection.getHost();
                    if (host == null) {
                        let err = new pip_services_commons_node_5.ConfigException(correlationId, "NO_HOST", "Connection host is not set");
                        callback(err);
                        return;
                    }
                    let port = connection.getPort();
                    if (port == 0) {
                        let err = new pip_services_commons_node_5.ConfigException(correlationId, "NO_PORT", "Connection port is not set");
                        callback(err);
                        return;
                    }
                    if (hosts.length > 0)
                        hosts += ',';
                    hosts += host + (port == null ? '' : ':' + port);
                    this._database = connection.getAsNullableString("database");
                    if (this._database == null) {
                        let err = new pip_services_commons_node_5.ConfigException(correlationId, "NO_DATABASE", "Connection database is not set");
                        callback(err);
                        return;
                    }
                }
                if (uri == null)
                    uri = "mongodb://" + hosts + "/" + this._database;
                let pollSize = this._options.getAsNullableInteger("poll_size");
                let keepAlive = this._options.getAsNullableInteger("keep_alive");
                let connectTimeoutMS = this._options.getAsNullableInteger("connect_timeout");
                let autoReconnect = this._options.getAsNullableBoolean("auto_reconnect");
                let maxPageSize = this._options.getAsNullableInteger("max_page_size");
                let debug = this._options.getAsNullableBoolean("debug");
                this._logger.debug(correlationId, "Connecting to mongodb database %s", this._database);
                let settings;
                try {
                    settings = {
                        server: {
                            poolSize: pollSize,
                            socketOptions: {
                                keepAlive: keepAlive,
                                connectTimeoutMS: connectTimeoutMS
                            },
                            auto_reconnect: autoReconnect,
                            max_page_size: maxPageSize,
                            debug: debug
                        }
                    };
                    if (credential && credential.getUsername()) {
                        settings.user = credential.getUsername();
                        settings.pass = credential.getPassword();
                    }
                    this._connection.open(uri, settings, (err) => {
                        if (err)
                            err = new pip_services_commons_node_6.ConnectionException(correlationId, "CONNECT_FAILED", "Connection to mongodb failed").withCause(err);
                        else
                            this._logger.debug(correlationId, "Connected to mongodb database %s", this._database);
                        callback(err);
                    });
                }
                catch (ex) {
                    let err = new pip_services_commons_node_6.ConnectionException(correlationId, "CONNECT_FAILED", "Connection to mongodb failed").withCause(ex);
                    callback(err);
                }
            }
        ], (err) => {
            if (callback)
                callback(err);
        });
    }
    close(correlationId, callback) {
        this._connection.close((err) => {
            if (err)
                err = new pip_services_commons_node_6.ConnectionException(correlationId, 'DISCONNECT_FAILED', 'Disconnect from mongodb failed: ').withCause(err);
            else
                this._logger.debug(correlationId, "Disconnected from mongodb database %s", this._database);
            if (callback)
                callback(err);
        });
    }
    clear(correlationId, callback) {
        // Return error if collection is not set
        if (this._collection == null) {
            if (callback)
                callback(new Error('Collection name is not defined'));
            return;
        }
        this._connection.db.dropCollection(this._collection, (err) => {
            if (err && err.message != "ns not found") {
                err = new pip_services_commons_node_6.ConnectionException(correlationId, "CONNECT_FAILED", "Connection to mongodb failed")
                    .withCause(err);
            }
            else if (err && err.message == "ns not found")
                err = null;
            if (callback)
                callback(err);
        });
    }
}
exports.MongoDbPersistence = MongoDbPersistence;
//# sourceMappingURL=MongoDbPersistence.js.map