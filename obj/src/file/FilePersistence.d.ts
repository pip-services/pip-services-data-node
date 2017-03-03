import { ConfigParams } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { JsonFilePersister } from './JsonFilePersister';
import { MemoryPersistence } from '../memory/MemoryPersistence';
export declare class FilePersistence<T> extends MemoryPersistence<T> implements IConfigurable {
    protected readonly _persister: JsonFilePersister<T>;
    constructor(persister?: JsonFilePersister<T>);
    configure(config: ConfigParams): void;
}
