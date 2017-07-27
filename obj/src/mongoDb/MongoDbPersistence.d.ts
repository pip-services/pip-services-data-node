import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IOpenable } from 'pip-services-commons-node';
import { ICleanable } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { Schema } from "mongoose";
import { MongoDbConnectionResolver } from './MongoDbConnectionResolver';
export declare class MongoDbPersistence implements IReferenceable, IConfigurable, IOpenable, ICleanable {
    private _defaultConfig;
    protected _logger: CompositeLogger;
    protected _connectionResolver: MongoDbConnectionResolver;
    protected _options: ConfigParams;
    protected _connection: any;
    protected _database: string;
    protected _collection: string;
    protected _model: any;
    protected _schema: Schema;
    constructor(collection?: string, schema?: Schema);
    setReferences(references: IReferences): void;
    configure(config: ConfigParams): void;
    protected convertToPublic(value: any): any;
    protected convertFromPublic(value: any): any;
    isOpened(): boolean;
    private composeSettings();
    open(correlationId: string, callback?: (err: any) => void): void;
    close(correlationId: string, callback?: (err: any) => void): void;
    clear(correlationId: string, callback?: (err: any) => void): void;
}
