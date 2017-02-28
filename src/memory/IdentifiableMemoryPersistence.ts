import { IIdentifiable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { SortParams } from 'pip-services-commons-node';
import { ObjectWriter } from 'pip-services-commons-node';
import { IdGenerator } from 'pip-services-commons-node';
import { NotFoundException } from 'pip-services-commons-node';

import { MemoryPersistence } from './MemoryPersistence';
import { IWriter } from '../.';
import { IGetter } from '../.';
import { ISetter } from '../.';
import { IQuerableReader } from '../.';
import { ILoader } from '../.';
import { ISaver } from '../.';

export class IdentifiableMemoryPersistence<T extends IIdentifiable<K>, K> extends MemoryPersistence<T> 
    implements IConfigurable, IWriter<T, K>, IGetter<T, K>, ISetter<T> {
    private readonly _defaultMaxPageSize: number = 100;

    protected _maxPageSize: number = this._defaultMaxPageSize;

    public constructor(loader?: ILoader<T>, saver?: ISaver<T>) {
        super(loader, saver);
    }

    public configure(config: ConfigParams): void {
        this._maxPageSize = config.getAsIntegerWithDefault("max_page_size", this._maxPageSize);
    }

    public getOneById(correlationId: string, id: K, callback: (err: any, item: T) => void): void {
        let items = this._items.filter((x) => {return x.id == id;});
        let item = items.length > 0 ? items[0] : null;

        if (item != null)
            this._logger.trace(correlationId, "Retrieved {0} by {1}", item, id);
        else
            this._logger.trace(correlationId, "Cannot find item by {1}", id);

        callback(null, item);
    }

    public create(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        if (item == null) {
            if (callback) callback(null, null);
            return;
        }

        if (item.id == null) {
            ObjectWriter.setProperty(item, "id", IdGenerator.nextLong());
        }

        this._items.push(item);
        this._logger.trace(correlationId, "Created {0}", item);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public set(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        if (item == null) {
            if (callback) callback(null, null);
            return;
        }

        if (item.id == null) {
            ObjectWriter.setProperty(item, "id", IdGenerator.nextLong());
        }

        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);

        if (index < 0) this._items.push(item);
        else this._items[index] = item;

        this._logger.trace(correlationId, "Set {0}", item);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public update(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);

        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = {0} was not found", item.id);
            callback(null, null);
            return;
        }

        this._items[index] = item;
        this._logger.trace(correlationId, "Updated {0}", item);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public deleteById(correlationId: string, id: K, callback?: (err: any, item: T) => void): void {
        var index = this._items.map((x) => { return x.id; }).indexOf(id);
        var item = this._items[index];

        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = {0} was not found", item.id);
            callback(null, null);
            return;
        }

        this._items.splice(index, 1);
        this._logger.trace(correlationId, "Deleted {0}", item);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        this._items = [];
        this._logger.trace(correlationId, "Cleared {0}");
        this.save(correlationId, callback);
    }

}
