import { ConfigParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
import { IIdentifiable } from 'pip-services-commons-node';
import { Schema } from "mongoose";
import { MongoDbPersistence } from './MongoDbPersistence';
import { IWriter, IGetter, ISetter } from '../.';
export declare class IdentifiableMongoDbPersistence<T extends IIdentifiable<K>, K> extends MongoDbPersistence implements IWriter<T, K>, IGetter<T, K>, ISetter<T> {
    protected _maxPageSize: number;
    constructor(collection: string, schema: Schema);
    configure(config: ConfigParams): void;
    protected getPageByFilter(correlationId: string, filter: any, paging: PagingParams, sort: any, select: any, callback: (err: any, items: DataPage<T>) => void): void;
    protected getListByFilter(correlationId: string, filter: any, sort: any, select: any, callback: (err: any, items: T[]) => void): void;
    getOneById(correlationId: string, id: K, callback: (err: any, item: T) => void): void;
    protected getOneRandom(correlationId: string, filter: any, callback: (err: any, item: T) => void): void;
    create(correlationId: string, item: T, callback?: (err: any, item: T) => void): void;
    set(correlationId: string, item: T, callback?: (err: any, item: T) => void): void;
    update(correlationId: string, item: T, callback?: (err: any, item: T) => void): void;
    deleteById(correlationId: string, id: K, callback?: (err: any, item: T) => void): void;
}
