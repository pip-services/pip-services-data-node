import { SortParams } from 'pip-services-commons-node';

export interface IQuerableReader<T> {
    getListByQuery(correlation_id: string, query: string, sort: SortParams): T[];
}
