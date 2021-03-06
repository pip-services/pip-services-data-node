let _ = require('lodash');

import { IIdentifiable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { SortParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
import { AnyValueMap } from 'pip-services-commons-node';
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

        // Filter and sort
        if (_.isFunction(filter))
            items = _.filter(items, filter);
        if (_.isFunction(sort))
            items = _.sortUniqBy(items, sort);

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

    public getListByIds(correlationId: string, ids: K[],
        callback: (err: any, items: T[]) => void): void {
        let filter = (item: T) => {
            return _.indexOf(ids, item.id) >= 0;
        }
        this.getListByFilter(correlationId, filter, null, null, callback);
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
            this._logger.trace(correlationId, "Retrieved item %s", id);
        else
            this._logger.trace(correlationId, "Cannot find item by %s", id);

        callback(null, item);
    }

    public create(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        item = _.clone(item);
        if (item.id == null)
            ObjectWriter.setProperty(item, "id", IdGenerator.nextLong());

        this._items.push(item);
        this._logger.trace(correlationId, "Created item %s", item.id);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public set(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        item = _.clone(item);
        if (item.id == null)
            ObjectWriter.setProperty(item, "id", IdGenerator.nextLong());

        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);

        if (index < 0) this._items.push(item);
        else this._items[index] = item;

        this._logger.trace(correlationId, "Set item %s", item.id);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public update(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        let index = this._items.map((x) => { return x.id; }).indexOf(item.id);

        if (index < 0) {
            this._logger.trace(correlationId, "Item %s was not found", item.id);
            callback(null, null);
            return;
        }

        item = _.clone(item);
        this._items[index] = item;
        this._logger.trace(correlationId, "Updated item %s", item.id);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public updatePartially(correlationId: string, id: K, data: AnyValueMap,
        callback?: (err: any, item: T) => void): void {
            
        let index = this._items.map((x) => { return x.id; }).indexOf(id);

        if (index < 0) {
            this._logger.trace(correlationId, "Item %s was not found", id);
            callback(null, null);
            return;
        }

        let item: any = this._items[index];
        item = _.extend(item, data.getAsObject())
        this._items[index] = item;
        this._logger.trace(correlationId, "Partially updated item %s", id);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    public deleteById(correlationId: string, id: K, callback?: (err: any, item: T) => void): void {
        var index = this._items.map((x) => { return x.id; }).indexOf(id);
        var item = this._items[index];

        if (index < 0) {
            this._logger.trace(correlationId, "Item %s was not found", id);
            callback(null, null);
            return;
        }

        this._items.splice(index, 1);
        this._logger.trace(correlationId, "Deleted item by %s", id);

        this.save(correlationId, (err) => {
            if (callback) callback(err, item)
        });
    }

    protected deleteByFilter(correlationId: string, filter: any, callback?: (err: any) => void): void {
        let deleted = 0;
        for (let index = this._items.length - 1; index>= 0; index--) {
            let item = this._items[index];
            if (filter(item)) {
                this._items.splice(index, 1);
                deleted++;
            }
        }

        if (deleted == 0) {
            callback(null);
            return;
        }

        this._logger.trace(correlationId, "Deleted %s items", deleted);

        this.save(correlationId, (err) => {
            if (callback) callback(err)
        });
    }

    public deleteByIds(correlationId: string, ids: K[], callback?: (err: any) => void): void {
        let filter = (item: T) => {
            return _.indexOf(ids, item.id) >= 0;
        }
        this.deleteByFilter(correlationId, filter, callback);
    }

}
