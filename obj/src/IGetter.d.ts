import { IIdentifiable } from 'pip-services-commons-node';
export interface IGetter<T extends IIdentifiable<K>, K> {
    getOneById(correlation_id: string, id: K, callback: (err: any, item: T) => void): void;
}
