let async = require('async');

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

import { Document, Model, Schema, createConnection, model } from "mongoose";

export class MongoDbPersistence implements IReferenceable, IConfigurable, IOpenable, ICleanable {

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
    protected _connectionResolver: ConnectionResolver = new ConnectionResolver();
    protected _credentialResolver: CredentialResolver = new CredentialResolver();
    protected _options: ConfigParams = new ConfigParams();

    protected _connection: any;
    protected _database: string;
    protected _collection: string;
    protected _model: any;

    public constructor(collection?: string, schema?: Schema) {
        this._connection = createConnection();
        this._collection = collection;
        
        if (collection != null && schema != null)
            this._model = this._connection.model(collection, schema)
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
    protected jsonToPublic(value: any): any {
        if (value && value.toJSON)
            value = value.toJSON();
        return value;
    }    

    public isOpened(): boolean {
        return this._connection.readyState == 1;
    }

    public open(correlationId: string, callback?: (err: any) => void): void {
        let connections: ConnectionParams[];
        let credential: CredentialParams;

        async.series([
            (callback) => {
                this._connectionResolver.resolveAll(correlationId, (err: any, result: ConnectionParams[]) => {
                    connections = result;
                    callback(err);
                });
            },
            (callback) => {
                this._credentialResolver.lookup(correlationId, (err: any, result: CredentialParams) => {
                    credential = result;
                    callback(err);
                });
            },
            (callback) => {
                if (connections == null && connections.length == 0) {
                    let err = new ConfigException(correlationId, "NO_CONNECTION", "Database connection is not set");
                    callback(err);
                    return;
                }

                let hosts = '';
                this._database = '';

                for (let index = 0; index < connections.length; index++) {
                    let connection = connections[index];

                    let host = connection.getHost();
                    if (host == null) {
                        let err = new ConfigException(correlationId, "NO_HOST", "Connection host is not set");
                        callback(err);
                        return;
                    }

                    let port = connection.getPort();
                    if (port == 0) {
                        let err = new ConfigException(correlationId, "NO_PORT", "Connection port is not set");
                        callback(err);
                        return;
                    }

                    if (hosts.length > 0)
                        hosts += ',';
                    hosts += host + (port == null ? '' : ':' + port);

                    this._database = connection.getAsNullableString("database");
                    if (this._database == null) {
                        let err = new ConfigException(correlationId, "NO_DATABASE", "Connection database is not set");
                        callback(err);
                        return;
                    }
                }

                let uri: string = "mongodb://" + hosts + "/" + this._database;

                let pollSize = this._options.getAsNullableInteger("poll_size");
                let keepAlive = this._options.getAsNullableInteger("keep_alive");
                let connectTimeoutMS = this._options.getAsNullableInteger("connect_timeout");
                let autoReconnect = this._options.getAsNullableBoolean("auto_reconnect");
                let maxPageSize = this._options.getAsNullableInteger("max_page_size");
                let debug = this._options.getAsNullableBoolean("debug");

                this._logger.debug(correlationId, "Connecting to mongodb database %s", this._database);

                let settings: any;

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
                            err = new ConnectionException(correlationId, "CONNECT_FAILED", "Connection to mongodb failed").withCause(err);
                        else
                            this._logger.debug(correlationId, "Connected to mongodb database %s", this._database);

                        callback(err);
                    });
                } catch (ex) {
                    let err = new ConnectionException(correlationId, "CONNECT_FAILED", "Connection to mongodb failed").withCause(ex);

                    callback(err);
                }
            }
        ], (err) => {
            if (callback) callback(err);
        });
    }

    public close(correlationId: string, callback?: (err: any) => void): void {
        this._connection.close((err) => {
            if (err)
                err = new ConnectionException(correlationId, 'DISCONNECT_FAILED', 'Disconnect from mongodb failed: ') .withCause(err);
            else
                this._logger.debug(correlationId, "Disconnected from mongodb database %s", this._database);

            if (callback) callback(err);
        });
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        // Return error if collection is not set
        if (this._collection == null) {
            if (callback) callback(new Error('Collection name is not defined'));
            return;
        }

        this._connection.db.dropCollection(this._collection, (err) => {
            if (err && err.message != "ns not found") {
                err = new ConnectionException(correlationId, "CONNECT_FAILED", "Connection to mongodb failed")
                    .withCause(err);
            } else if (err && err.message == "ns not found")
                err = null;
            
            if (callback) callback(err);
        });
    }

}
