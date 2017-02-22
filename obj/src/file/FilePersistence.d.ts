import { IIdentifiable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { JsonFilePersister } from './JsonFilePersister';
import { MemoryPersistence } from '../memory/MemoryPersistence';
export declare class FilePersistence<T extends IIdentifiable<K>, K> extends MemoryPersistence<T, K> {
    protected readonly _persister: JsonFilePersister<T>;
    constructor(persister?: JsonFilePersister<T>);
    configure(config: ConfigParams): void;
}
