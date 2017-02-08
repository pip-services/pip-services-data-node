export interface IWriter<T, K> {
    create(correlation_id: string, entity: T, callback?: (err: any, data: T) => void): void;
    update(correlation_id: string, entity: T, callback?: (err: any, data: T) => void): void;
    deleteById(correlation_id: string, id: K, callback?: (err: any, data: T) => void): void;
}
