import { IIdentifiable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';

import { IdentifiableMemoryPersistence } from '../memory/IdentifiableMemoryPersistence';
import { JsonFilePersister } from './JsonFilePersister'

export class IdentifiableFilePersistence<T extends IIdentifiable<K>, K> extends IdentifiableMemoryPersistence<T, K> {
    protected readonly _persister: JsonFilePersister<T>;

    public constructor(persister?: JsonFilePersister<T>) {
        if (persister == null) 
            persister = new JsonFilePersister<T>();

        super(persister, persister);

        this._persister = persister;
    }

    public configure(config: ConfigParams): void {
        super.configure(config);
        this._persister.configure(config);
    }

}
