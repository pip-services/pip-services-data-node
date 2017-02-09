import { IIdentifiable, IStringIdentifiable, IReferenceable, IReferences, IConfigurable, IOpenable, ICleanable } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-commons-node';
import { ConfigParams, SortParams } from 'pip-services-commons-node';
import { ObjectWriter, IdGenerator } from 'pip-services-commons-node';
import { NotFoundException } from 'pip-services-commons-node';

import { IWriter } from '../.';
import { IGetter } from '../.';
import { ISetter } from '../.';
import { IQuerableReader } from '../.';
import { ILoader } from '../.';
import { ISaver } from '../.';

export class MemoryPersistence<T extends IIdentifiable<K>, K> implements IReferenceable, IConfigurable, IOpenable, ICleanable,
    IWriter<T, K>, IGetter<T, K>, ISetter<T> {

    private readonly _defaultMaxPageSize: number = 100;

    protected _logger: CompositeLogger = new CompositeLogger();

    protected _maxPageSize: number = this._defaultMaxPageSize;
    protected _entities: T[] = [];
    protected _loader: ILoader<T>;
    protected _saver: ISaver<T>;
    protected _opened: boolean = false;

    public constructor(loader?: ILoader<T>, saver?: ISaver<T>) {
        this._loader = loader;
        this._saver = saver;
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
    }

    public configure(config: ConfigParams): void {
        this._maxPageSize = config.getAsIntegerWithDefault("max_page_size", this._maxPageSize);
    }

    public isOpened(): boolean {
        return this._opened;
    }

    public open(correlationId: string,  callback?: (err?: any) => void): void {
        this.load(correlationId, (err) => {
            this._opened = true;
            if (callback)
                callback(err);
        });
    }

    private load(correlationId: string, callback?: (err?: any) => void): void {
        if (this._loader == null) {
            if (callback)
                callback();
            return;
        }
            
        this._loader.load(correlationId, (err: Error, data: T[]) => {
            this._entities = data;
            this._logger.trace(correlationId, "Loaded {0} of {1}", this._entities.length);

            if (callback)
                callback(err);
        });
    }

    public close(correlationId: string, callback?: (err?: any) => void): void {
        this.save(correlationId, (err) => {
            this._opened = false;
            if (callback)
                callback(err);
        });
    }

    public save(correlationId: string, callback?: (err?: any) => void): void {
        if (this._saver == null) {
            if (callback)
                callback();
            return;
        }

        var task = this._saver.save(correlationId, this._entities, (err: Error) => {
            this._logger.trace(correlationId, "Saved {0} of {1}", this._entities.length);

            if (callback)
                callback(err);
        });
    }

    public getOneById(correlationId: string, id: K, callback: (err: any, data: T) => void): void {
        var items = this._entities.filter((x) => {return x.id == id;});
        var item = items.length > 0 ? items[0] : null;

        if (item != null)
            this._logger.trace(correlationId, "Retrieved {0} by {1}", item, id);
        else
            this._logger.trace(correlationId, "Cannot find {0} by {1}", id);

        callback(null, item);
    }

    public create(correlationId: string, entity: T, callback?: (err: any, data: T) => void): void {
        if (entity == null) {
            if (callback)
                callback(null, null);
            return;
        }

        if (entity.id == null) {
            ObjectWriter.setProperty(entity, "id", IdGenerator.nextLong());
        }

        this._entities.push(entity);
        this._logger.trace(correlationId, "Created {0}", entity);

        this.save(correlationId, (err) => {
            if (callback)
                callback(err, entity)
        });
    }

    public set(correlationId: string, entity: T, callback?: (err: any, data: T) => void): void {
        if (entity == null) {
            if (callback)
                callback(null, null);
            return;
        }

        if (entity.id == null) {
            ObjectWriter.setProperty(entity, "id", IdGenerator.nextLong());
        }

        var index = this._entities.map((x) => { return x.id; }).indexOf(entity.id);

        if (index < 0) this._entities.push(entity);
        else this._entities[index] = entity;

        this._logger.trace(correlationId, "Set {0}", entity);

        this.save(correlationId, (err) => {
            if (callback)
                callback(err, entity)
        });
    }

    public update(correlationId: string, entity: T, callback?: (err: any, data: T) => void): void {
        var index = this._entities.map((x) => { return x.id; }).indexOf(entity.id);

        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = {0} was not found", entity.id);
            callback(null, null);
            return;
        }

        this._entities[index] = entity;
        this._logger.trace(correlationId, "Updated {0}", entity);

        this.save(correlationId, (err) => {
            if (callback)
                callback(err, entity)
        });
    }

    public deleteById(correlationId: string, id: K, callback?: (err: any, data: T) => void): void {
        var index = this._entities.map((x) => { return x.id; }).indexOf(id);
        var entity = this._entities[index];

        if (index < 0) {
            this._logger.trace(correlationId, "Item with id = {0} was not found", entity.id);
            callback(null, null);
            return;
        }

        this._entities.splice(index, 1);
        this._logger.trace(correlationId, "Deleted {0}", entity);

        this.save(correlationId, (err) => {
            if (callback)
                callback(err, entity)
        });
    }

    public clear(correlationId: string, callback?: (err?: any) => void): void {
        this._entities = [];
        this._logger.trace(correlationId, "Cleared {0}");
        this.save(correlationId, callback);
    }

}
