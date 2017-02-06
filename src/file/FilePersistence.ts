import { IIdentifiable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';

import { JsonFilePersister } from './JsonFilePersister'
import { MemoryPersistence } from '../memory/MemoryPersistence';
import { ILoader } from '../.';
import { ISaver } from '../.';

export class FilePersistence<T extends IIdentifiable<K>, K> extends MemoryPersistence<T, K> {

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
