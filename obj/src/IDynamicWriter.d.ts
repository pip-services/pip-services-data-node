import { AnyValueMap } from 'pip-services-commons-node';
export interface IDynamicWriter<T, K> {
    create(correlation_id: string, data: AnyValueMap, callback?: (err: any, item: T) => void): void;
    update(correlation_id: string, id: K, data: AnyValueMap, callback?: (err: any, item: T) => void): void;
    deleteById(correlation_id: string, id: K, callback?: (err: any, item: T) => void): void;
}
