import { IIdentifiable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';

import { JsonFilePersister } from './JsonFilePersister'
import { MemoryPersistence } from '../memory/MemoryPersistence';
import { ILoader } from '../ILoader';
import { ISaver } from '../ISaver';

export class FilePersistence<T> extends MemoryPersistence<T> implements IConfigurable {
    protected readonly _persister: JsonFilePersister<T>;

    public constructor(persister?: JsonFilePersister<T>) {
        if (persister == null)
            persister = new JsonFilePersister<T>();

        super(persister, persister);

        this._persister = persister;
    }

    public configure(config: ConfigParams): void {
        this._persister.configure(config);
    }

}
