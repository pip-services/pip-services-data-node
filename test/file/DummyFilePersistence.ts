import { ConfigParams } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';

import { JsonFilePersister } from '../../src/file/JsonFilePersister';
import { DummyMemoryPersistence } from '../memory/DummyMemoryPersistence';
import { Dummy } from '../Dummy';

export class DummyFilePersistence extends DummyMemoryPersistence {
	protected _persister: JsonFilePersister<Dummy>;

    public constructor(path?: string) {
        super();

        this._persister = new JsonFilePersister<Dummy>(path);
        this._loader = this._persister;
        this._saver = this._persister;
    }

    public configure(config: ConfigParams): void {
        super.configure(config);
        this._persister.configure(config);
    }

}