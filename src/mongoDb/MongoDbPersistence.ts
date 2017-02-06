var mongoose = require('mongoose');
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

import { IWriter } from '../.';
import { IGetter } from '../.';
import { ISetter } from '../.';
import { ILoader } from '../.';
import { ISaver } from '../.';

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
    protected _collection: any;

    public constructor(collectionName: string) {
        if (collectionName == null)
            throw new Error("collectionName could not be null");

        this._collectionName = collectionName;
        this._connection = mongoose.createConnection();
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

    public isOpened(): boolean {
        return this._connection.readyState == 1;
    }

    public open(correlation_id: string): void {
        let connection: ConnectionParams;
        let credential: CredentialParams;

        async.series([
            (callback) => {
                this._connectionResolver.resolve(correlation_id, (err: any, result: ConnectionParams) => {
                    var connection = result;
                    callback(err);
                });
            },
            (callback) => {
                this._credentialResolver.lookup(correlation_id, (err: any, result: CredentialParams) => {
                    var credential = result;
                    callback(err);
                });
            }
        ], (err) => {
            if (err)
                throw new ConfigException(correlation_id, "CONNECTION_ERROR", "Connectionotions is not set properly")
                    .withCause(err);

            if (connection == null)
                throw new ConfigException(correlation_id, "NO_CONNECTION", "Database connection is not set");

            var host = connection.getHost();
            if (host == null)
                throw new ConfigException(correlation_id, "NO_HOST", "Connection host is not set");

            var port = connection.getPort();
            if (port == 0)
                throw new ConfigException(correlation_id, "NO_PORT", "Connection port is not set");

            var databaseName = connection.getAsNullableString("database");
            if (databaseName == null)
                throw new ConfigException(correlation_id, "NO_DATABASE", "Connection database is not set");

            this._logger.trace(correlation_id, "Connecting to mongodb database {0}, collection {1}", databaseName, this._collectionName);

            try {
                // var settings = {
                //     server: new MongoServerAddress(host, port),
                //     MaxConnectionPoolSize =  _options.GetAsInteger("poll_size"),
                //     ConnectTimeout = _options.GetAsTimeSpan("connect_timeout"),
                //     //SocketTimeout =
                //     //    new TimeSpan(options.GetInteger("server.socketOptions.socketTimeoutMS")*
                //     //                 TimeSpan.TicksPerMillisecond)
                // };

                // if (credential.Username != null)
                // {
                //     var dbCredential = MongoCredential.CreateCredential(databaseName, credential.Username, credential.Password);
                //     settings.Credentials = new[] { dbCredential };
                // }

                // _connection = new MongoClient(settings);
                // _database = _connection.GetDatabase(databaseName);
                // _collection = _database.GetCollection<T>(_collectionName);

                // _logger.Debug(correlationId, "Connected to mongodb database {0}, collection {1}", databaseName, _collectionName);
            } catch (ex) {
                throw new ConnectionException(correlation_id, "ConnectFailed", "Connection to mongodb failed")
                    .withCause(ex);
            }
        });
    }

    public close(correlation_id: string): void {
        this._connection.close();
    }

    private load(correlation_id: string): void {
    }

    public getOneById(correlationId: string, id: K): T {
        return;
    }

    public save(correlation_id: string): void {
    }

    public create(correlation_id: string, entity: T): T {
        return;
    }

    public set(correlation_id: string, entity: T): T {
        return;
    }

    public update(correlation_id: string, entity: T): T {
        return;
    }

    public deleteById(correlation_id: string, id: K): T {
        return;
    }

    public clear(correlation_id: string): void {
        this._connection.db.dropCollection(this._collectionName, (err) => {
            if (err)
                throw new BadRequestException(correlation_id, "DropCollectionFailed", "Connection to mongodb failed")
                    .withCause(err);
        });
    }

}
