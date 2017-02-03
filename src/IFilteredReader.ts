import { FilterParams } from 'pip-services-commons-node';
import { SortParams } from 'pip-services-commons-node';

export interface IFilteredReader<T> {
    getListByFilter(correlation_id: string, filter: FilterParams, sort: SortParams): T[];
}
