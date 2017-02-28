export interface IWriter<T, K> {
    create(correlation_id: string, item: T, callback?: (err: any, item: T) => void): void;
    update(correlation_id: string, item: T, callback?: (err: any, item: T) => void): void;
    deleteById(correlation_id: string, id: K, callback?: (err: any, item: T) => void): void;
}
