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
export declare class MongoDbPersistence<T> implements IReferenceable, IConfigurable, IOpenable, ICleanable {
    private _defaultConfig;
    protected _logger: CompositeLogger;
    protected _connectionResolver: ConnectionResolver;
    protected _credentialResolver: CredentialResolver;
    protected _options: ConfigParams;
    protected _connection: any;
    protected _database: string;
    protected _collection: string;
    protected _model: any;
    constructor(collection?: string, schema?: Schema);
    setReferences(references: IReferences): void;
    configure(config: ConfigParams): void;
    protected jsonToPublic(value: any): any;
    isOpened(): boolean;
    open(correlationId: string, callback?: (err: any) => void): void;
    close(correlationId: string, callback?: (err: any) => void): void;
    clear(correlationId: string, callback?: (err: any) => void): void;
}
