var async = require('async');

import { IIdentifiable } from 'pip-services-commons-node';
import { IStringIdentifiable } from 'pip-services-commons-node';
import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IOpenable } from 'pip-services-commons-node';
import { ICleanable } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { ConnectionResolver } from 'pip-services-commons-node';
import { CredentialResolver } from 'pip-services-commons-node';
import { ConnectionParams } from 'pip-services-commons-node';
import { CredentialParams } from 'pip-services-commons-node';
import { ConfigException } from 'pip-services-commons-node';
import { ConnectionException } from 'pip-services-commons-node';
import { BadRequestException } from 'pip-services-commons-node';
import { ObjectWriter } from 'pip-services-commons-node';
import { IdGenerator } from 'pip-services-commons-node';

import { Document, Model, Schema, createConnection, model } from "mongoose";

import { IWriter, IGetter, ISetter, ILoader, ISaver } from '../.';

export class MongoDbPersistence<T extends IIdentifiable<K>, K> implements IReferenceable, IConfigurable, IOpenable, ICleanable,
    IWriter<T, K>, IGetter<T, K>, ISetter<T> {

    private _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        "connection.type", "mongodb",
        "connection.database", "test",
        "connection.host", "localhost",
        "connection.port", 27017,

        "options.poll_size", 4,
        "options.keep_alive", 1,
        "options.connect_timeout", 5000,
        "options.auto_reconnect", true,
        "options.max_page_size", 100,
        "options.debug", true
    );

    protected _logger: CompositeLogger = new CompositeLogger();
    protected readonly _collectionName: string;
    protected _connectionResolver: ConnectionResolver = new ConnectionResolver();
    protected _credentialResolver: CredentialResolver = new CredentialResolver();
    protected _options: ConfigParams = new ConfigParams();

    protected _connection: any;
    protected _database: any;
    protected _model: any;

    public constructor(collectionName: string, schema: Schema) {
        if (collectionName == null)
            throw new Error("collectionName could not be null");

        this._collectionName = collectionName;
        this._connection = createConnection();
        this._model = this._connection.model(this._collectionName, schema)
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }

    public configure(config: ConfigParams): void {
        config = config.setDefaults(this._defaultConfig);

        this._connectionResolver.configure(config, true);
        this._credentialResolver.configure(config, true);

        this._options = this._options.override(config.getSection("options"));
    }

    // Convert object to JSON format
    private jsonToPublic(value: any): any {
        if (value && value.toJSON)
            value = value.toJSON();
        return value;
    }    

    public isOpened(): boolean {
        return this._connection.readyState == 1;
    }

    public open(correlationId: string, callback?: (err: any) => void): void {
        let connection: ConnectionParams;
        let credential: CredentialParams;

        async.series([
            (callback) => {
                this._connectionResolver.resolve(correlationId, (err: any, result: ConnectionParams) => {
                    connection = result;
                    callback(err);
                });
            },
            (callback) => {
                this._credentialResolver.lookup(correlationId, (err: any, result: CredentialParams) => {
                    credential = result;
                    callback(err);
                });
            }
        ], (err) => {
            if (err)
                throw new ConfigException(correlationId, "CONNECTION_ERROR", "Connectionotions is not set properly")
                    .withCause(err);

            if (connection == null)
                throw new ConfigException(correlationId, "NO_CONNECTION", "Database connection is not set");

            var host = connection.getHost();
            if (host == null)
                throw new ConfigException(correlationId, "NO_HOST", "Connection host is not set");

            var port = connection.getPort();
            if (port == 0)
                throw new ConfigException(correlationId, "NO_PORT", "Connection port is not set");

            var databaseName = connection.getAsNullableString("database");
            if (databaseName == null)
                throw new ConfigException(correlationId, "NO_DATABASE", "Connection database is not set");

            var pollSize = this._options.getAsNullableInteger("poll_size");
            var keepAlive = this._options.getAsNullableInteger("keep_alive");
            var connectTimeoutMS = this._options.getAsNullableInteger("connect_timeout");
            var auto_reconnect = this._options.getAsNullableBoolean("auto_reconnect");
            var max_page_size = this._options.getAsNullableInteger("max_page_size");
            var debug = this._options.getAsNullableBoolean("debug");

            this._logger.trace(correlationId, "Connecting to mongodb database {0}, collection {1}", databaseName, this._collectionName);

            let uri: string = "mongodb://" + host + (port == null ? "" : ":" + port) + "/" + databaseName;
            let settings: any;

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
            } catch (ex) {
                throw new ConnectionException(correlationId, "ConnectFailed", "Connection to mongodb failed")
                    .withCause(ex);
            }
        });
    }

    public close(correlationId: string, callback?: (err: any) => void): void {
        this._connection.close((err) => {
            if (err) {
                err = new ConnectionException(correlationId, 'DisconnectFailed', 'Disconnect from mongodb failed: ')
                    .withCause(err);
            } else {
                this._logger.trace(correlationId, "Disconnected from {0} successfully", this._collectionName);
            };
            callback(err);
        });
    }

    public getOneById(correlationId: string, id: K, callback: (err: any, data: T) => void): void {
        this._model.findById(id, (err, data) => {
            if (!err)
                this._logger.trace(correlationId, "Retrieved from {0} with id = {1}", this._collectionName, id);
            if (callback) {
                data = this.jsonToPublic(data);
                callback(err, data);
            }
        });
    }

    public create(correlationId: string, entity: T, callback?: (err: any, data: T) => void): void {
        if (entity == null) {
            if (callback)
                callback(null, null);
            return;
        }

        if (entity.id == null) {
            ObjectWriter.setProperty(entity, "id", IdGenerator.nextLong());
        }

        (entity as any)._id = entity.id;

        this._model.create(entity, (err, data) => {
            if (!err)
                this._logger.trace(correlationId, "Created in {0} with id = {1}", this._collectionName, data.id);
            if (callback) {
                data = this.jsonToPublic(data);
                callback(err, data);
            }
        });
    }

    public set(correlationId: string, entity: T, callback?: (err: any, data: T) => void): void {
        if (entity == null) {
            if (callback)
                callback(null, null);
            return;
        }

        if (entity.id == null) {
            ObjectWriter.setProperty(entity, "id", IdGenerator.nextLong());
        }

        (entity as any)._id = entity.id;

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

    public update(correlationId: string, entity: T, callback?: (err: any, data: T) => void): void {
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

    public deleteById(correlationId: string, id: K, callback?: (err: any, data: T) => void): void {
        this._model.findByIdAndRemove(id, (err, data) => {
            if (!err)
                this._logger.trace(correlationId, "Deleted from {0} with id = {1}", this._collectionName, id);
            if (callback) {
                data = this.jsonToPublic(data);
                callback(err, data);
            }
        });
    }

    public clear(correlationId: string, callback?: (err?: any) => void): void {
        this._connection.db.dropCollection(this._collectionName, (err) => {
            if (err && err.message != "ns not found")
                err = new BadRequestException(correlationId, "DropCollectionFailed", "Connection to mongodb failed")
                    .withCause(err);
            else if (err && err.message == "ns not found")
                err = null;
            
            if (callback) 
                callback(err);
        });
    }

}
