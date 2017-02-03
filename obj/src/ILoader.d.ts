export interface ILoader<T> {
    load(correlation_id: string): T[];
}
