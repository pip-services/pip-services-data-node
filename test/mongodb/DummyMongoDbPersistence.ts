import { ConfigParams } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';

import { IdentifiableMongoDbPersistence } from '../../src/mongodb/IdentifiableMongoDbPersistence';
import { Dummy } from '../Dummy';
import { IDummyPersistence } from '../IDummyPersistence';
import { DummyMongoDbSchema } from './DummyMongoDbSchema';

export class DummyMongoDbPersistence 
    extends IdentifiableMongoDbPersistence<Dummy, string> 
    implements IDummyPersistence
{
    public constructor() {
        super('dummy', DummyMongoDbSchema());
    }

    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, 
        callback: (err: any, page: DataPage<Dummy>) => void): void {
        filter = filter || new FilterParams();
        let key = filter.getAsNullableString('key');

        let filterCondition: any = {};
        if (key != null)
            filterCondition['key'] = key;

        super.getPageByFilter(correlationId, filterCondition, paging, null, null, callback);
    }
}