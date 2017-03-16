import { IIdentifiable } from 'pip-services-commons-node';
import { Schema } from "mongoose";
import { MongoDbPersistence } from './MongoDbPersistence';
import { IWriter, IGetter, ISetter } from '../.';
export declare class IdentifiableMongoDbPersistence<T extends IIdentifiable<K>, K> extends MongoDbPersistence implements IWriter<T, K>, IGetter<T, K>, ISetter<T> {
    constructor(collection: string, schema: Schema);
    getOneById(correlationId: string, id: K, callback: (err: any, item: T) => void): void;
    create(correlationId: string, item: T, callback?: (err: any, item: T) => void): void;
    set(correlationId: string, item: T, callback?: (err: any, item: T) => void): void;
    update(correlationId: string, item: T, callback?: (err: any, item: T) => void): void;
    deleteById(correlationId: string, id: K, callback?: (err: any, item: T) => void): void;
}
