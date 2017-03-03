import { IIdentifiable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { MemoryPersistence } from './MemoryPersistence';
import { IWriter } from '../.';
import { IGetter } from '../.';
import { ISetter } from '../.';
import { ILoader } from '../.';
import { ISaver } from '../.';
export declare class IdentifiableMemoryPersistence<T extends IIdentifiable<K>, K> extends MemoryPersistence<T> implements IConfigurable, IWriter<T, K>, IGetter<T, K>, ISetter<T> {
    private readonly _defaultMaxPageSize;
    protected _maxPageSize: number;
    constructor(loader?: ILoader<T>, saver?: ISaver<T>);
    configure(config: ConfigParams): void;
    getOneById(correlationId: string, id: K, callback: (err: any, item: T) => void): void;
    create(correlationId: string, item: T, callback?: (err: any, item: T) => void): void;
    set(correlationId: string, item: T, callback?: (err: any, item: T) => void): void;
    update(correlationId: string, item: T, callback?: (err: any, item: T) => void): void;
    deleteById(correlationId: string, id: K, callback?: (err: any, item: T) => void): void;
    clear(correlationId: string, callback?: (err: any) => void): void;
}
