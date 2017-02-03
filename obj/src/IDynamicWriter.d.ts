import { AnyValueMap } from 'pip-services-commons-node';
export interface IDynamicWriter<T, K> {
    create(correlation_id: string, entityData: AnyValueMap): T;
    update(correlation_id: string, id: K, entityData: AnyValueMap): T;
    deleteById(correlation_id: string, id: K): T;
}
