import { IIdentifiable } from 'pip-services-commons-node';
import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IOpenable } from 'pip-services-commons-node';
import { ICleanable } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { ConnectionResolver } from 'pip-services-commons-node';
import { CredentialResolver } from 'pip-services-commons-node';
import { Schema } from "mongoose";
import { IWriter, IGetter, ISetter } from '../.';
export declare class MongoDbPersistence<T extends IIdentifiable<K>, K> implements IReferenceable, IConfigurable, IOpenable, ICleanable, IWriter<T, K>, IGetter<T, K>, ISetter<T> {
    private _defaultConfig;
    protected _logger: CompositeLogger;
    protected readonly _collectionName: string;
    protected _connectionResolver: ConnectionResolver;
    protected _credentialResolver: CredentialResolver;
    protected _options: ConfigParams;
    protected _connection: any;
    protected _database: any;
    protected _model: any;
    constructor(collectionName: string, schema: Schema);
    setReferences(references: IReferences): void;
    configure(config: ConfigParams): void;
    private jsonToPublic(value);
    isOpened(): boolean;
    open(correlationId: string, callback?: (err: any) => void): void;
    close(correlationId: string, callback?: (err: any) => void): void;
    getOneById(correlationId: string, id: K, callback: (err: any, data: T) => void): void;
    create(correlationId: string, entity: T, callback?: (err: any, data: T) => void): void;
    set(correlationId: string, entity: T, callback?: (err: any, data: T) => void): void;
    update(correlationId: string, entity: T, callback?: (err: any, data: T) => void): void;
    deleteById(correlationId: string, id: K, callback?: (err: any, data: T) => void): void;
    clear(correlationId: string, callback?: (err?: any) => void): void;
}
