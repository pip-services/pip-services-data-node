import { AnyValueMap } from 'pip-services-commons-node';

export interface IWriter<T, K> {
    create(correlation_id: string, entity: T): T;
    update(correlation_id: string, entity: T): T;
    deleteById(correlation_id: string, id: K): T;
}
