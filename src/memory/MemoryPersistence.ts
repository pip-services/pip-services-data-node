import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { IOpenable } from 'pip-services-commons-node';
import { ICleanable } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-commons-node';

import { ILoader } from '../.';
import { ISaver } from '../.';

export class MemoryPersistence<T> implements IReferenceable, IOpenable, ICleanable {
    protected _logger: CompositeLogger = new CompositeLogger();
    protected _items: T[] = [];
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

    public isOpened(): boolean {
        return this._opened;
    }

    public open(correlationId: string,  callback?: (err: any) => void): void {
        this.load(correlationId, (err) => {
            this._opened = true;
            if (callback) callback(err);
        });
    }

    private load(correlationId: string, callback?: (err: any) => void): void {
        if (this._loader == null) {
            if (callback) callback(null);
            return;
        }
            
        this._loader.load(correlationId, (err: any, items: T[]) => {
            this._items = items;
            this._logger.trace(correlationId, "Loaded {0} of {1}", this._items.length);
            if (callback) callback(err);
        });
    }

    public close(correlationId: string, callback?: (err: any) => void): void {
        this.save(correlationId, (err) => {
            this._opened = false;
            if (callback) callback(err);
        });
    }

    public save(correlationId: string, callback?: (err: any) => void): void {
        if (this._saver == null) {
            if (callback) callback(null);
            return;
        }

        let task = this._saver.save(correlationId, this._items, (err: any) => {
            this._logger.trace(correlationId, "Saved {0} of {1}", this._items.length);

            if (callback) callback(err);
        });
    }

    public clear(correlationId: string, callback?: (err?: any) => void): void {
        this._items = [];
        this._logger.trace(correlationId, "Cleared {0}");
        this.save(correlationId, callback);
    }

}
