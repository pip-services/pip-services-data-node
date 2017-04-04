let _ = require('lodash');

import { IIdentifiable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { SortParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
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
    protected _maxPageSize: number = 100;

    public constructor(loader?: ILoader<T>, saver?: ISaver<T>) {
        super(loader, saver);
    }

    public configure(config: ConfigParams): void {
        this._maxPageSize = config.getAsIntegerWithDefault("options.max_page_size", this._maxPageSize);
    }

    protected getPageByFilter(correlationId: string, filter: any, 
        paging: PagingParams, sort: any, select: any, 
        callback: (err: any, page: DataPage<T>) => void): void {
        
        let items = this._items;

        // Apply filter
        if (_.isFunction(filter))
            items = _.filter(items, filter);

        // Extract a page
        paging = paging != null ? paging : new PagingParams();
        let skip = paging.getSkip(-1);
        let take = paging.getTake(this._maxPageSize);

        let total = null;
        if (paging.total)
            total = items.length;
        
        if (skip > 0)
            items = _.slice(items, skip);
        items = _.take(items, take);

        // Apply sorting
        if (_.isFunction(sort))
            items = _.sortUniqBy(items, sort);
        
        this._logger.trace(correlationId, "Retrieved %d items", items.length);
        
        let page = new DataPage<T>(items, total);
        callback(null, page);
    }

    protected getListByFilter(correlationId: string, filter: any, sort: any, select: any,
        callback: (err: any, items: T[]) => void): void {
        
        let items = this._items;

        // Apply filter
        if (_.isFunction(filter))
            items = _.filter(items, filter);

        // Apply sorting
        if (_.isFunction(sort))
            items = _.sortUniqBy(items, sort);
        
        this._logger.trace(correlationId, "Retrieved %d items", items.length);
        
        callback(null, items);
    }

    protected getOneRandom(correlationId: string, filter: any, callback: (err: any, item: T) => void): void {
        let items = this._items;

        // Apply filter
        if (_.isFunction(filter))
            items = _.filter(items, filter);

        let item: T = items.length > 0 ? _.sample(items) : null;
        
        if (item != null)
            this._logger.trace(correlationId, "Retrieved a random item");
        else
            this._logger.trace(correlationId, "Nothing to return as random item");
                        
        callback(null, item);
    }

    public getOneById(correlationId: string, id: K, callback: (err: any, item: T) => void): void {
        let items = this._items.filter((x) => {return x.id == id;});
        let item = items.length > 0 ? items[0] : null;

        if (item != null)
            this._logger.trace(correlationId, "Retrieved %s by %s", item, id);
        else
            this._logger.trace(correlationId, "Cannot find item by %s", id);

        callback(null, item);
    }

    public create(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        if (item == null) {
            if (callback) callback(null, null);
            return;
        }

        item = _.clone(item);
        if (item.id == null)
            ObjectWriter.setProperty(item, "id", IdGenerator.nextLong());

        this._items.push(item);
        this._logger.trace(correlationId, "Created %s", item);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public set(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        if (item == null) {
            if (callback) callback(null, null);
            return;
        }

        item = _.clone(item);
        if (item.id == null)
            ObjectWriter.setProperty(item, "id", IdGenerator.nextLong());

        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);

        if (index < 0) this._items.push(item);
        else this._items[index] = item;

        this._logger.trace(correlationId, "Set %s", item);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public update(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);

        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = %s was not found", item.id);
            callback(null, null);
            return;
        }

        item = _.clone(item);
        this._items[index] = item;
        this._logger.trace(correlationId, "Updated %s", item);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public deleteById(correlationId: string, id: K, callback?: (err: any, item: T) => void): void {
        var index = this._items.map((x) => { return x.id; }).indexOf(id);
        var item = this._items[index];

        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = %s was not found", id);
            callback(null, null);
            return;
        }

        this._items.splice(index, 1);
        this._logger.trace(correlationId, "Deleted %s", item);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        this._items = [];
        this._logger.trace(correlationId, "Cleared %s");
        this.save(correlationId, callback);
    }

}
