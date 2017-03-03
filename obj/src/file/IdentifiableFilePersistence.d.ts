import { IIdentifiable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { IdentifiableMemoryPersistence } from '../memory/IdentifiableMemoryPersistence';
import { JsonFilePersister } from './JsonFilePersister';
export declare class IdentifiableFilePersistence<T extends IIdentifiable<K>, K> extends IdentifiableMemoryPersistence<T, K> {
    protected readonly _persister: JsonFilePersister<T>;
    constructor(persister?: JsonFilePersister<T>);
    configure(config: ConfigParams): void;
}
