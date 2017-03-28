import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';

import { IGetter } from '../src/IGetter';
import { IWriter } from '../src/IWriter';
import { Dummy } from './Dummy';

export interface IDummyPersistence extends IGetter<Dummy, String>, IWriter<Dummy, String> {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<Dummy>) => void): void;
    getOneById(correlationId: string, id: string, callback: (err: any, item: Dummy) => void): void;
    create(correlationId: string, item: Dummy, callback: (err: any, item: Dummy) => void): void;
    update(correlationId: string, item: Dummy, callback: (err: any, item: Dummy) => void): void;
    deleteById(correlationId: string, id: string, callback: (err: any, item: Dummy) => void): void;
}