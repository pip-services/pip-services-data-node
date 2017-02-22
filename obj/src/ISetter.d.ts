export interface ISetter<T> {
    set(correlation_id: string, entity: T, callback?: (err: any, data: T) => void): void;
}
