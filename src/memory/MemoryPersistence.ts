import { IIdentifiable } from 'pip-services-commons-node';
import { IStringIdentifiable } from 'pip-services-commons-node';
import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IOpenable } from 'pip-services-commons-node';
import { ICleanable } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { SortParams } from 'pip-services-commons-node';
import { ObjectWriter } from 'pip-services-commons-node';
import { IdGenerator } from 'pip-services-commons-node';

import { IWriter } from '../.';
import { IGetter } from '../.';
import { ISetter } from '../.';
import { IQuerableReader } from '../.';
import { ILoader } from '../.';
import { ISaver } from '../.';

export class MemoryPersistence<T extends IIdentifiable<K>, K> implements IReferenceable, IConfigurable, IOpenable, ICleanable,
    IWriter<T, K>, IGetter<T, K>, ISetter<T>, IQuerableReader<T> {

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

    public open(correlation_id: string): void {
        this.load(correlation_id);
        this._opened = true;
    }

    public close(correlation_id: string): void {
        this.save(correlation_id);
        this._opened = false;
    }

    private load(correlation_id: string): void {
        if (this._loader == null) return;
            
        this._entities = this._loader.load(correlation_id);
        this._logger.trace(correlation_id, "Loaded {0} of {1}", this._entities.length);
    }

    public getListByQuery(correlation_id: string, query: string, sort: SortParams): T[] {
        let result: T[];

        this._logger.trace(correlation_id, "Retrieved {0} of {1}", this._entities.length);
        result = this._entities.slice(0);

        return result;
    }

    public getOneById(correlationId: string, id: K): T {
        var items = this._entities.filter((x) => {return x.id == id;});
        var item = items.length > 0 ? items[0] : null;

        if (item != null)
            this._logger.trace(correlationId, "Retrieved {0} by {1}", item, id);
        else
            this._logger.trace(correlationId, "Cannot find {0} by {1}", id);

        return item;
    }

    public save(correlation_id: string): void {
    	if (this._saver == null) return;
        var task = this._saver.save(correlation_id, this._entities);
        this._logger.trace(correlation_id, "Saved {0} of {1}", this._entities.length);
    }

    public create(correlation_id: string, entity: T): T {
        let identifiable: IStringIdentifiable;
        if (typeof entity.id == "string" || entity.id == null)
            identifiable = (entity as any) as IStringIdentifiable;

        if (identifiable != null && entity.id == null)
            ObjectWriter.setProperty(entity, "id", IdGenerator.nextLong());

        this._entities.push(entity);
        this._logger.trace(correlation_id, "Created {0}", entity);

        this.save(correlation_id);

        return entity;
    }

    public set(correlation_id: string, entity: T): T {
        let identifiable: IStringIdentifiable;
        if (typeof entity.id == "string" || entity.id == null)
            identifiable = (entity as any) as IStringIdentifiable;

        if (identifiable != null && entity.id == null)
            ObjectWriter.setProperty(entity, "id", IdGenerator.nextLong());

        var index = this._entities.map((x) => { return x.id; }).indexOf(entity.id);

        if (index < 0) this._entities.push(entity);
        else this._entities[index] = entity;

        this._logger.trace(correlation_id, "Set {0}", entity);
        this.save(correlation_id);
        return entity;
    }

    public update(correlation_id: string, entity: T): T {
        var index = this._entities.map((x) => { return x.id; }).indexOf(entity.id);

        if (index < 0) return null;

        this._entities[index] = entity;
        this._logger.trace(correlation_id, "Updated {0}", entity);
        this.save(correlation_id);

        return entity;
    }

    public deleteById(correlation_id: string, id: K): T {
        var index = this._entities.map((x) => { return x.id; }).indexOf(id);
        var entity = this._entities[index];

        if (index < 0) return null;

        this._entities.splice(index, 1);
        this._logger.trace(correlation_id, "Deleted {0}", entity);
        this.save(correlation_id);

        return entity;
    }

    public clear(correlation_id: string): void {
        this._entities = [];
        this._logger.trace(correlation_id, "Cleared {0}");
        this.save(correlation_id);
    }

}
