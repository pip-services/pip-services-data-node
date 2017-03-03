import { DataPage } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { SortParams } from 'pip-services-commons-node';
export interface IQuerablePageReader<T> {
    getPageByQuery(correlation_id: string, query: string, paging: PagingParams, sort: SortParams, callback: (err: any, page: DataPage<T>) => void): void;
}
