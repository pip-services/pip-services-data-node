import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { IOpenable } from 'pip-services-commons-node';
import { ICleanable } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-commons-node';
import { ILoader } from '../.';
import { ISaver } from '../.';
export declare class MemoryPersistence<T> implements IReferenceable, IOpenable, ICleanable {
    protected _logger: CompositeLogger;
    protected _items: T[];
    protected _loader: ILoader<T>;
    protected _saver: ISaver<T>;
    protected _opened: boolean;
    constructor(loader?: ILoader<T>, saver?: ISaver<T>);
    setReferences(references: IReferences): void;
    isOpened(): boolean;
    open(correlationId: string, callback?: (err: any) => void): void;
    private load(correlationId, callback?);
    close(correlationId: string, callback?: (err: any) => void): void;
    save(correlationId: string, callback?: (err: any) => void): void;
    clear(correlationId: string, callback?: (err?: any) => void): void;
}
