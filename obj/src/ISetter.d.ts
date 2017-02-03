export interface ISetter<T> {
    set(correlation_id: string, entity: T): T;
}
