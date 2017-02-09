import { AnyValueMap } from 'pip-services-commons-node';
export interface IDynamicWriter<T, K> {
    create(correlation_id: string, entityData: AnyValueMap, callback?: (err: any, data: T) => void): void;
    update(correlation_id: string, id: K, entityData: AnyValueMap, callback?: (err: any, data: T) => void): void;
    deleteById(correlation_id: string, id: K, callback?: (err: any, data: T) => void): void;
}
