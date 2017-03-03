export interface ILoader<T> {
    load(correlation_id: string, callback: (err: any, items: T[]) => void): void;
}
