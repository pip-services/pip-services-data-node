import { AnyValueMap } from 'pip-services-commons-node';

export interface IPartialUpdater<T, K> {
    updatePartially(correlation_id: string, id: K, data: AnyValueMap, callback?: (err: any, item: T) => void): void;
}
