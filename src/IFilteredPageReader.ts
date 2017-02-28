import { DataPage } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { SortParams } from 'pip-services-commons-node';

export interface IFilteredPageReader<T> {
    getPageByFilter(correlation_id: string, filter: FilterParams, paging: PagingParams, sort: SortParams, 
        callback: (err: any, page: DataPage<T>) => void): void;
}
