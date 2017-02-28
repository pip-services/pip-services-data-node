export interface ISetter<T> {
    set(correlation_id: string, item: T, callback?: (err: any, item: T) => void): void;
}
